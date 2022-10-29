# Code Like a Cowboy
![Header image](./storage/cowboy-dalle-2-min.png)
Simple NPM package to create code snippets in different languages

> :warning: This package is in **very early development**! DO NOT USE

## Current support
- `.go`: GoLang
- `.js|ts`: JavaScript/TypeScript (NodeJS)
- `.php`: PHP
- `.py`: Python
- `.rb`: Ruby
- `.rs`: Rust
- `.sh`: Bash

### Sample fiddles
```sh
┌──(root㉿cowboy)-[~/cowboy]
└─# cowboy fiddle.all
GoLang (go1.18.2): Hello World!
Node (v18.2.0): Hello World!
PHP (8.1.5): Hello World!
Python (v3.10.4): Hello World!
Ruby (3.0.3): Hello World!
Rust (v0.1.0): Hello World!
Bash (5.1.16(1)-release): Hello World!
Node (v18.2.0): Hello World!
```

## Getting started

## Launch docker environment
```
./restart.sh
```

### How to link/unlink
Make the command global

**Link**
```
cd /path/to/this/repo
npm link
```

**Unlink**
```
npm unlink cowboy
```

### Commands
- `cowboy <command>`: Run a command (or create)
- `cowboy list`: List all available commands
- `cowboy open <command>`: Open the command in code editor
- `cowboy new <command>`: Create a new command
- `cowboy clone <public-repo-url>`: Clone a public repository
- `cowboy fiddle(.[all, *])`: Sample fiddle based on language extension (optional)
- `cowboy tinker(.[py,sh])`: Tinker based on the language extension (optional)

## Notes
Some rough notes while shaping the project

### Roadmap
- Dockerize (partially implemented)
- Protect against potential vulnerabilities
- Add tests for core modules
- ...

### Wishlist
- Git integration: Enable easy integration with open source git repos. For example) `cowboy clone git@github.com:org/repo.git`
- Cross-platform OS support, consider core overrides per OS
- Convert core/local packages to pull requests for main repo. For example) `cowboy publish <command>`
- Integration with https://github.com/charmbracelet/charm
- ...
