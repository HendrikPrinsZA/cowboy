#!/usr/bin/env python3

import subprocess
import pyfiglet

ascii_banner = pyfiglet.figlet_format('Cowboy')
print(ascii_banner)

output = subprocess.run(['cowboy', '--help'], text=True, capture_output=True)
print(output.stdout.strip())

exit(0)
