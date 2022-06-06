# To-do's
Starting to lose track of the to-do's...

## Test alternative ports
Findings
 - Initial idea was to mask all ports with 69*, but BitTorrent screwed that up (https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers)
 - Lucky Lukes horse's number was 7, so considered going with 77 but not convinced
  - Trying 7 as prefix
 - Lucky Luke is a Western bande dessinée series created by Belgian cartoonist Morris in 1946.
  - Go with 96 as the prefix (swing on 69 why not)
  - Returning to this idea, decided to use 1946 as the main port (all we need for now, SIMPLIFY!)

## Requirements (local)
Ensure the critical core commands have native support. Based on the core package. Further obfuscation will be needed when extended beyond NPM, but for now it will be over enigineering to consider this.

## Requirements (container)
Check eack core package for dependencies.
- Python dependencies (requirements.txt) 
```
python3 -m pip install -r requirements.txt
```

## Ideas
- Check out popular to-do CLI apps
- Create local password generator (good example use-case)
