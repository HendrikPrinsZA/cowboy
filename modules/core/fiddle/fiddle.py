#!/usr/bin/env python3

import sys

releaselevel = sys.version_info.releaselevel

version = '.'.join([
  str(sys.version_info.major),
  str(sys.version_info.minor),
  str(sys.version_info.micro)
])

print(f"Python (v{version}): Hello World!")

