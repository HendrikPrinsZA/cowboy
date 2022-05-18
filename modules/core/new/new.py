#!/usr/bin/env python3

import stat
import os
import sys

scriptDir = os.path.realpath(__file__).replace('/core/new/new.py', '/local')

command = sys.argv[1]
commandPath = f"{scriptDir}/{command}"

parts = command.split('.')

def createCommandFromTemplate(commandPath):
  content = []
  if ".js" in commandPath:
    content = [
      "#!/usr/bin/env node",
      "",
      "console.log('Hello from Node');"
    ]
  if ".php" in commandPath:
    content = [
      "<?php",
      "",
      "echo 'Hello from PHP';"
    ]
  if ".py" in commandPath:
    content = [
      "#!/usr/bin/env python3",
      "",
      "print('Hello from Python')"
    ]
  if ".sh" in commandPath:
    content = [
      "#!/usr/bin/env bash",
      "",
      "echo 'Hello from Bash'"
    ]

  with open(commandPath, 'w') as f:
    f.write('\n'.join(content))
    f.close()

    os.chmod(commandPath, stat.S_IRWXU)
    cowboy = f"cowboy open {command}"
    os.system(cowboy)

if len(parts) > 1:
  commandName = parts[0]
  commandExt = '.'.join(parts[1:])

  commandPath = f"{scriptDir}/{commandName}/{commandName}.{commandExt}"

  if not os.path.isdir(f"{scriptDir}/{commandName}"):
    os.mkdir(f"{scriptDir}/{commandName}")

  if not os.path.isfile(commandPath):
    createCommandFromTemplate(commandPath)

  if not os.access(commandPath, os.X_OK):
    os.chmod(commandPath, stat.S_IRWXU)

  exit(0)

command = sys.argv[1]
commandPath = f"{scriptDir}/{command}"
if not os.path.isdir(commandPath):
  os.mkdir(commandPath)

# default to python
extension = "py"
commandPath = f"{commandPath}/{command}.{extension}"
if not os.path.isfile(commandPath):
  with open(commandPath, 'w') as f:
    content = [
      "#!/usr/bin/env python3",
      "",
      f"print('Hello from {command}')"
    ]
    f.write('\n'.join(content))
    f.close()

    os.chmod(commandPath, stat.S_IRWXU)
    
    os.system(f"cowboy rifle open {command}")
