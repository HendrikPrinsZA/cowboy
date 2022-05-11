#!/usr/bin/env python3
import os

def get_extensions(path):
  extensions = []
  module = path.split('/')[:-1][-1]
  for file in os.listdir(path):
    if os.path.isdir(file): continue
    if file.startswith('.'): continue
    
    if not file.startswith(module):
      continue
    
    extension = os.path.splitext(file)[1]
    extensions.append(extension.replace('.', ''))
  
  return extensions

def print_modules(title:str, path:str):
  path = os.path.realpath(path)

  commands = []
  for dir in os.listdir(path):
    if dir.startswith('.'): continue
    if os.path.isfile(dir): continue
    
    extensions = get_extensions(f"{path}/{dir}/")

    # if no extensions found, assume incomplete and ignore
    if len(extensions) == 0: continue

    commands.append(f"- {dir} [{', '.join(extensions)}]")
  
  print(f"{title}")
  if len(commands) > 0:
    print("\n".join(commands))
  else:
    print("- No commands found")

MODULES_DIR = os.path.realpath(__file__).replace('/list/list.py', '/../')
print_modules("\nCore", f"{MODULES_DIR}/core")
print_modules("\nLocal", f"{MODULES_DIR}/local")
print_modules("\nPublic", f"{MODULES_DIR}/public")
