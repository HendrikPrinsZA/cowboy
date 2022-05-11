#!/usr/bin/env python3

import stat
import os
import sys

PUBLIC_DIR = os.path.realpath(__file__).replace('/core/clone/clone.py', '/public')

try: 
    TARGET_URL = sys.argv[1]
except:
    print(f"Error: Expected the first argument to be the repository's URL")
    exit(1)

# check if valid git repo
resp = os.system(f"git ls-remote {TARGET_URL} --quiet")
if resp != 0:
    print(f"Error: Invalid url '{TARGET_URL}'")
    exit(1)

# check if directory already exists
TARGET_BASE = os.path.basename(TARGET_URL).replace('.git', '')
TARGET_DIR = f"{PUBLIC_DIR}/{TARGET_BASE}"
if os.path.isdir(TARGET_DIR):
    print(f"Error: Directory already exists '{TARGET_DIR}'")
    exit(1)

# should be good to clone at this point
resp = os.system(f"git clone {TARGET_URL} {TARGET_DIR}")
if resp != 0:
    print(f"Error: Unable to clone '{TARGET_URL}'")
    exit(1)

cowboy = f"cowboy open {TARGET_BASE}"
os.system(cowboy)