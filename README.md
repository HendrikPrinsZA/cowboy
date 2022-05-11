# Cowboy - Code like a cowboy
Create solutions in any popular scripting language

> :warning: This package is in **very early development**! DO NOT USE

## Getting started
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
- `cowboy fiddle.[js,php,py,sh]`: Sample fiddle based on language extension
- `cowboy tinker [js,php,py,sh]`: Tinker based on the language extension

## Notes
Some rought notes while shaping the project

### Elevator pitch
Simple NPM package to create solutions with different programming languages

### Roadmap
- Dockerize
- Protect against potential vulnerabilities
- Add tests for core modules
- ...

### Wishlist
- Git integration: Enable easy integration with open source git repos. For example) `cowboy clone git@github.com:org/repo.git`
- Cross-platform OS support, consider core overrides per OS
- Convert core/local packages to pull requests for main repo. For example) `cowboy publish <command>`
- ...
