#!/usr/bin/env python3

import argparse
from datetime import datetime
import json
import os
import re
import base64

LOGS_DIR = os.path.realpath(__file__.replace('/log.py', '/../../../storage/log'))

HOSTNAME = os.getenv('HOSTNAME')

if HOSTNAME is None:
    HOSTNAME = os.getenv('USER')

if HOSTNAME is None:
    HOSTNAME = os.path.basename(os.getenv('HOME'))

def get_file_lines(filepath):
    lines = []

    if not os.path.isfile(filepath):
        return lines

    file = open(filepath, "r")
    for line in file:
        for _line in line.splitlines():
            if len(_line) > 0:
                lines.append(_line)

    return lines

def read_file(filepath):
    print("File contents\n```")
    lines = get_file_lines(filepath)
    for line in lines:
        print(line)
    print("\n```")

def file_line_count(filepath):
    lines = get_file_lines(filepath)
    count = len(lines)
    return count

def append_line(filepath, line):
    if file_line_count(filepath) == 0:
        with open(filepath, 'w') as f:
            line = f"[DATE_TIME] hostname (name): message\n"
            f.write(line)
            f.close()

    with open(filepath, 'a') as f:
        line = f"[{DATE_TIME}] {args.log_hostname} ({args.log_name}): {message}"
        f.write(f"{line}\n")
        f.close()
    
    return True

def verbose(level: int = 0, message: str = None):
    if level == 0:
        return

    print(message)

def json_decode_safe(original):
    decoded = original

    try:
        decoded = json.loads(decoded)
        return decoded
    except:
        os.system(f"cowboy log --log-name error 'Failed to json decode {original}'")
        print(f"Error: Failed to decode at 1, raw value was: {original}")
        exit(1)

    return False

parser = argparse.ArgumentParser(
    description = "Cowboy logger",
    formatter_class = argparse.ArgumentDefaultsHelpFormatter
)

parser.add_argument(
    "--log-name",
    help = "The name of the logfile, defaults to 'cowboy'", 
    type = str,
    default = "cowboy",
)

parser.add_argument(
    "--log-hostname", 
    help = f"The hostname of the client machine, defaults to '{HOSTNAME}'", 
    type = str,
    default = f"{HOSTNAME}"
)

parser.add_argument(
    "--log-response-json",
    help = "The response in JSON format", 
    type = str,
    default = None
)

parser.add_argument(
    "--log-response-base64",
    help = "The response in Base64 format", 
    type = str,
    default = None
)

parser.add_argument(
    "--log-verbosity",
    help = "Level of verbosity (0: Silent - default, 1: Log all)", 
    type = int, 
    choices = [0, 1],
    default = 0
)

args, unknown = parser.parse_known_args()
message = ' '.join(unknown)

if len(message) == 0:
    if int(args.log_verbosity) > 0:
        print("Nothing passed to log...")
    exit(0)

LOG_UNIQ = datetime.now().strftime("%Y-%m-%d")
LOG_NAME = re.sub("[^0-9a-zA-Z]+", "", args.log_name)
LOG_DIR = f"{LOGS_DIR}/{LOG_NAME}"
LOG_PATH = f"{LOG_DIR}/{LOG_UNIQ}.log"

if not os.path.isdir(LOG_DIR):
    os.mkdir(LOG_DIR)

DATE_TIME = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

line = f"[{DATE_TIME}] {args.log_hostname} ({args.log_name}): {message}"
append_line(LOG_PATH, line)

# Parse JSON
if args.log_response_json is not None:
    decoded = json_decode_safe(args.log_response_json)
    pretty = json.dumps(decoded, indent = 2)
    with open(LOG_PATH, 'a') as f:
        f.write(f"```\n{pretty}\n```\n")
        f.close()

    if int(args.log_verbosity) > 0:
        print(pretty)

# Parse Base64
if args.log_response_base64 is not None:
    decoded = base64.b64decode(args.log_response_base64).decode('utf8')
    decoded = json.loads(decoded)
    pretty = json.dumps(decoded, indent = 2)

    with open(LOG_PATH, 'a') as f:
        f.write(f"```\n{pretty}\n```\n")
        f.close()

    if int(args.log_verbosity) > 0:
        print(pretty)
    
