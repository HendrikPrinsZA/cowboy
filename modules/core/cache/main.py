#!/usr/bin/env python3

import os
import sys

from lib.cache import Cache

"""
Generic class allowing for simple local file cache

Example usage via CLI basic key value
```
./cache.py key1 'Value of key 1'
```

Example usage via CLI json
```
./cache.py "{'key1': 'Value of key 1'}"
```

"""

# Constats
ARGV = sys.argv
CACHE_DIR = os.path.realpath(__file__).replace('/main.py', '/.cache')
DEFAULT_CACHE_NAME = "default.json"
DEFAULT_CACHE_PATH = F"{CACHE_DIR}/{DEFAULT_CACHE_NAME}"

# Variables
context_args = ARGV[1:]
config_path = DEFAULT_CACHE_PATH

# Check if first argument is the cache name
# - path to the file (relative or absolute)
# - cachename.json
if len(context_args) > 0 and ".json" in context_args[0]:
    filename = context_args.pop(0)
    if os.path.isfile(filename):
        config_path = filename
    else:
        config_path = f"{CACHE_DIR}/{filename}"

cache = Cache(config_path)

# If no other arguments passed, assumed clear
if len(context_args) == 0:
    cache.clear()
    exit(0)

# Get value by key
if len(context_args) == 1:
    key = str(context_args[0])
    
    response = cache.get(key)
    if response is None:
        exit(1)
    
    print(response)
    exit(0)

# Set value by key
if len(context_args) == 2:
    key = str(context_args[0])
    value = str(context_args[1])
    cache.set(key, value)
    print(cache.get(key))
    exit(0)

print("Error: Unhandled exception")
print(context_args)
exit(1)