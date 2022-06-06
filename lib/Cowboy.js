const path = require('path');
const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const commandExistsSync = require('command-exists').sync;
const { convertResponse } = require('./helpers');

const TIMESTART = process.hrtime();

// import State from './State';

module.exports = class Cowboy {
  /** @type {String} */
  myCommandName = 'cowboy';

  /** @type {bool} */
  dockerEnabled = true;

  /** @type {String} */
  dockerContainerName = 'cowboy-kali';

  /** @type {string} */
  cowboyPath = '';

  /** @type {string} */
  homePath = '';

  /** @type {Array} */
  moduleDirs = [
    'local', 
    'core', 
    'public'
  ];
  
  /** @type {Array} */
  baseNames = [
    '{commandName}',
    'main', 
    'index'
  ];

  /** @type {Array} */
  extensions = [
    'go',
    'js',
    'php',
    'py',
    'rb',
    'rs',
    'sh',
    'ts',
  ];

  /** @type {Array} */
  debugLog = [];

  benchmarkData = null;

  constructor(options) {
    // this.state = new State();
    this.hostname = 'ghostname';

    this.options = options;
    this.homePath = this.getHomePath();
    this.cowboyPath = this.getCowboyPath();
    this.hostname = process.env.HOSTNAME;
    this.execOptions = {
      stdio: 'inherit'
    };

    if (this.options.silent) {
      this.execOptions.stdio = 'ignore';
    }

    // Could look at something like this maybe?
    // https://javascript.plainenglish.io/testing-javascript-performance-with-benchmark-js-3d3f4e4b9fc2
    if (this.options.benchmark) {
      this.benchmarkData = {
        hrtime: process.hrtime(TIMESTART),
        entries: {}
      };
      
      // this.state.bench('boot');
    }

    this.dockerIsAvailable = this.isDockerAvailable();
  }

  isDockerAvailable() {
    if (this.dockerEnabled !== true) { 
      return false; 
    }

    // Older docker versions
    // https://docs.docker.com/engine/release-notes/prior-releases/#deprecations
    if (fs.existsSync('/.dockerenv')) {
      return false; 
    }

    // We should have docker installed!
    if (!commandExistsSync('docker')) {
      return false;
    }

    try {
      this.runThroughDocker('cowboy ping --silent');
    } catch (error) {
      this.logError(error, 'Unexpected error!');
      return false;
    }
  
    return true;
  }

  run(command) {
    const responses = [];
    const rawExtension = path.extname(command).toLowerCase().trim().replace('.', '');
    const commandName = command.replace(`.${rawExtension}`, '');
    let runAll = false;
    let extension = rawExtension;
    
    if (extension === '') {
      extension = null;
    }

    if (extension === 'all') {
      extension = null;
      runAll = true;
    }

    if (this.dockerIsAvailable) {
      const cleanArgs = this.getCleanArgs(3);
      return this.runThroughDocker(`cowboy ${command}`, cleanArgs);
    }
    
    const commandPaths = this.findCommandPaths(commandName, extension);
    for (const commandPath of commandPaths) {
      let response = this.runCommand(commandPath);
      try {
        response = JSON.parse(response);
      } catch (error) { }

      if (!runAll) {
        break;
      }
    }

    return responses;
  }

  getBaseNames(commandName, extension) {
    const baseNames = this.baseNames;
    baseNames[0] = baseNames[0].replace('{commandName}', commandName);
    return baseNames;
  }

  findCommandPaths(commandName, extension = null, limit = null) {
    const commandPaths = [];
    const baseNames = this.getBaseNames(commandName);
    const extensions = extension !== null ? [extension] : this.extensions;

    // Loop through module paths
    for (const moduleDir of this.moduleDirs) {
      const modulePath = `${this.cowboyPath}/modules/${moduleDir}`;
     
      if (!this.canRead(modulePath)) {
        continue;
      }

      // Loop through base names
      for (const baseName of baseNames) {
        const basePath = `${modulePath}/${baseName}`;

        if (!this.canRead(basePath)) {
          continue;
        }

        // Loop through extensions
        for (const ext of extensions) {
          const commandPath = `${basePath}/${baseName}.${ext}`

          if (!this.canRead(commandPath)) {
            continue;
          }

          if (!this.canExecute(commandPath)) {
            continue;
          }

          commandPaths.push(commandPath);
          if (limit > 0 && commandPaths.length >= limit) {
            return commandPaths;
          }
        }
      }
    }

    return commandPaths;
  }

  runByExtension(commandName, extension) {
    const commandPaths = this.findCommandPaths(commandName, extension);
    
    const responses = [];
    const dirNames = [
      'local', 
      'core', 
      'public'
    ];
    
    const baseNames = [
      commandName, 
      'main', 
      'index'
    ];

    const extensions = [
      extension
    ];

    for (const dirName of dirNames) {
      const dirPath = `${this.cowboyPath}/modules/${dirName}`
      if (!this.canRead(dirPath)) {
        continue;
      }

      for (const baseName of baseNames) {
        const basePath = `${dirPath}/${baseName}`
        for (const allowedExtension of extensions) {
          const commandPath = `${basePath}/${baseName}.${allowedExtension}`
          
          if (!this.canExecute(commandPath)) {
            continue;
          }

          const response = this.runCommand(commandPath);
          
          if (response !== null) {
            responses.push({
              command: commandPath,
              response: response
            });
          }
        }
      }
    }

    return responses;
  }

  formatResponse(response) {
    return convertResponse(response);
  }

  execSync(cmd, cleanArgs = []) {
    const cmd0 = cmd.split(' ')[0] ?? null;
    let response = null;
    let execFile = false;

    // Safety catch
    if (!cmd0) {
      console.log(`Error: Unhandled exception. Did not expect $cmd0 of ${cmd0} to be false!`);
      process.exit(1);
    }

    // Check if file & executable
    if (cmd0 !== 'cowboy' && this.canExecute(cmd0)) {
      execFile = true;
    }

    // Always append the args to the cmd
    if (cleanArgs != null && cleanArgs.length > 0) {
      cmd = `${cmd} ${cleanArgs.join(' ')}`;
    }

    try {
      if (execFile) {
        response = execFileSync(cmd0, cleanArgs);
      } else {
        response = execSync(cmd, this.execOptions);
      }

      response = this.formatResponse(response);

      if (response !== null && !this.options.silent) {
        console.log(response);
      }

    } catch (error) {
      this.logError(error.toString());
      process.exit(0);
    }

    return response;
  }

  runThroughDocker(cmd, args = [], interactive = false) {
    const command = 'docker-compose';
    const path = this.cowboyPath;
    const projectDir = fs.realpathSync(path);

    const cleanArgv = [
      `--project-directory='${projectDir}'`,
      'exec',
      this.dockerContainerName
    ];

    for (const word of cmd.split(' ')) {
      cleanArgv.push(word);
    }

    for (const arg of args) {
      cleanArgv.push(arg);
    }

    return this.execSync(command, cleanArgv);
  }

  /**
   * Log something
   * 
   * @param {String} type Type of log (defaults to 'message')
   * @param {String} message The message line (defaults to '')
   * @param {*} data The data likethe response or error
   * @returns 
   */
  log(type = 'message', data = null, message = null) {
    const cleanArgs = [
      '--log-name', this.myCommandName,
      '--log-type', type,
    ];

    // Append the command
    cleanArgs.push(this.myCommandName)
    
    // Append the message
    cleanArgs.push(this.getCleanArgs(2).join(' '));

    if (data !== null && data !== '') {
      data = JSON.stringify(data);
      const logDataBase64 = Buffer.from(data, 'utf8').toString('base64');
      cleanArgs.push(`--log-data-base64`);
      cleanArgs.push(logDataBase64);
    }
    
    // Set the message
    const commandPath = `${this.cowboyPath}/modules/core/log/log.py`;
    
    if (message !== null) {
      cleanArgs.push('--log-message')
      cleanArgs.push(message)
    };

    return execFileSync(commandPath, cleanArgs, { 
      stdio: 'ignore'
    });
  }

  logMessage(data = null, message = null) {
    if (this.options.silent) {
      return;
    }

    return this.log('message', data, message);
  }

  logError(data = null, message = null) {
    return this.log('error', data, message);
  }

  getCowboyPath() {
    const baseName = path.basename(__dirname);
    return fs.realpathSync(__dirname.replace(`/${baseName}`, ''));
  }

  getHomePath() {
    return process.env.HOME || process.env.USERPROFILE;
  }

  canRead(absPath) {
    const permissions = this.getPermissions(absPath)
    return permissions.canRead
  }

  canExecute(absPath) {
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

  runCommandWithProgram(cmd, commandPath, cleanArgv = []) {
    cleanArgv.unshift(commandPath);
    const response = this.execSync(cmd, cleanArgv);
    return this.formatResponse(response);
  }

  /**
   * Returns the intended arguments
   * 
   * Example)
   * - Original: [/path/to/node, /path/to/cowboy, fiddle, arg1, arg2, arg3]
   * - Cleaned: [arg1, arg2, arg3]
   * 
   * @returns array of arguments
   */
  getCleanArgs(slice = 3) {
    const { argv } = process;
    const cleanArgv = argv.slice(slice);
    return cleanArgv;
  }

  /**
   * Run a command by path
   * 
   * @param {String} commandPath Absolute path to the command
   * @returns response
   */
  runCommand(commandPath) {
    const cleanArgs = this.getCleanArgs();
    const ext = path.extname(commandPath);

    switch (ext) {
      // case '.custom-example': return this.runCommandWithProgram('custom-example run', commandPath, cleanArgs);
      default: return this.execSync(commandPath, cleanArgs);
    }
  }
};
