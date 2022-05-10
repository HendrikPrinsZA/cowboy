#!/usr/bin/env python3

import os
import sys

"""
Run as interactive shell
"""
COMMANDS = dict({
  "php": f"php -a",
  "js": f"node",
  "sh": f"/usr/bin/env bash",
  "py": f"/usr/bin/env python3"
})

try:
  argv1 = sys.argv[1]
except IndexError:
  argv1 = 'py'

if argv1 not in COMMANDS:
  print(f"Unexpected command of '{argv1}', expected: {', '.join(COMMANDS.keys())}")
  exit(1)

# To-do:
# copy arguments after
# - use argc[1:]/argc[2:]?
os.system(COMMANDS[argv1])
exit(0)