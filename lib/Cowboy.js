const path = require('path');
const prompt = require('prompt');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const { exit } = require('process');

module.exports = class Main {
  /** @type {bool} */
  detached = false;

  /** @type {string} */
  codePath = '';

  /** @type {string} */
  homePath = '';

  /** @type {Array} */
  allowedExtensions = [
    'sh',
    'py',
    'php',
  ];

  constructor() {
    this.homePath = this.getHomePath();
    this.codePath = this.getCodePath();
  }

  // Run shit
  async run(command) {
    const mainFiles = [command, 'main', 'index'];

    // If command contains extension, us it
    const extension = path.extname(command)

    if (extension.length > 0) {
      const commandName = command.replace(extension, '')
      const commandPathLocal = `${this.codePath}/local/${commandName}/${command}`;
      const commandPathCore = `${this.codePath}/core/${commandName}/${command}`;
      const commandPathPublic = `${this.codePath}/public/${commandName}/${command}`;

      if (this.canExecutePath(commandPathLocal)) {
        return this.runCommand(commandPathLocal);
      }

      if (this.canExecutePath(commandPathPublic)) {
        return this.runCommand(commandPathPublic);
      }

      if (this.canExecutePath(commandPathCore)) {
        return this.runCommand(commandPathCore);
      }
    }

    for (const extension of this.allowedExtensions) {
      for (const mainFile of mainFiles) {
        const commandPathCore = `${this.codePath}/core/${command}/${mainFile}.${extension}`;
        const commandPathLocal = `${this.codePath}/local/${command}/${mainFile}.${extension}`;
        const commandPathPublic = `${this.codePath}/public/${command}/${mainFile}.${extension}`;

        if (this.canExecutePath(commandPathLocal)) {
          return this.runCommand(commandPathLocal);
        }

        if (this.canExecutePath(commandPathPublic)) {
          return this.runCommand(commandPathPublic);
        }

        if (this.canExecutePath(commandPathCore)) {
          return this.runCommand(commandPathCore);
        }

        // verbose
        // console.error(`Command not found: "${commandPath}"`);
      }
    }

    // Command not found here!
    const answer = await prompt.get({
      name: 'yesno',
      message: `Command '${command}' not found, do you want to create it?`,
      validator: /Y|y|n/,
      default: 'Y',
    }).catch(() => {
      console.log("\nBye!");
      exit(0);
    });

    if (answer.yesno.toLowerCase() !== 'y') {
      console.log("Bye!");
      exit(0);
    }
    
    return this.runCommandWithExec('cowboy', '', `new ${command}`)
  }

  /**
   * In case we want to detach it from this directory
   * - Not sure yet?
   */
  getCodePath() {
    if (this.detached) {
      return `${this.homePath}/.cowboy`;
    }

    const baseName = path.basename(__dirname);
    return __dirname.replace(`/${baseName}`, '/modules');
  }

  getHomePath() {
    return process.env.HOME || process.env.USERPROFILE;
  }

  canExecutePath(absPath) {
    const permissions = this.getPermissions(absPath)
    return permissions.canExecute
  }

  getPermissions(absPath) {
    const resp = {
      canRead: false,
      canExecute: false
    };

    try {
      fs.accessSync(absPath, fs.constants.R_OK);
      resp.canRead = true;
    } catch (err) {
      return resp;
    }

    try {
      fs.accessSync(absPath, fs.constants.X_OK);
      resp.canExecute = true;
    } catch (err) {
      return resp;
    }

    return resp;
  }

  runCommandWithExec(execPath, commandPath, cleanArgv) {
    try {
      const res = execSync(`${execPath} ${commandPath} ${cleanArgv}`);
      console.log(res.toString());
    } catch (err) {
      // Might not be req...?
      // console.log(err.stderr.toString());
      exit(1);
    }
  }

  runCommandDirect(commandPath) {
    const { argv } = process;

    // To-do: Further debugging req here
    // - Not sure about executing commands directly, for ex) cowboy random1 (create new)
    // console.log(`fn: runCommandDirect, commandPath: ${commandPath}`)

    const shell = spawn(commandPath, argv.slice(3), { stdio: 'inherit' })
    shell.on('close', (code) => {
      if (code !== 0) {
        console.error('Something went wrong!', code)
      }
    })
  }

  runCommand(commandPath) {
    const { argv } = process;

    // To-do: Input sanitation here for sure
    const cleanArgv = argv.slice(3).join(' ').trim();

    // catch extension exceptions
    const ext = path.extname(commandPath);
    if (ext === '.php') {
      return this.runCommandWithExec('php', commandPath, cleanArgv);
    }

    return this.runCommandDirect(commandPath, cleanArgv);
  }
};
