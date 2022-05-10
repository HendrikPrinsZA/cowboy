#!/usr/bin/env python3
import os

def getExtensions(path):
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

def printModules(title:str, path:str):
  print(f"{title}")

  for dir in os.listdir(path):
    if dir.startswith('.'): continue
    if os.path.isfile(dir): continue
    
    extensions = getExtensions(f"{path}/{dir}/")

    # if no extensions found, assume incomplete and ignore
    if len(extensions) == 0: continue

    print(f"- {dir} [{', '.join(extensions)}]")

pathModules = os.path.realpath(__file__).replace('/list/list.py', '/../')
pathModulesCore = os.path.realpath(f"{pathModules}/core")
pathModulesLocal = os.path.realpath(f"{pathModules}/local")

printModules("\nCore", pathModulesCore)
printModules("\nLocal", pathModulesLocal)