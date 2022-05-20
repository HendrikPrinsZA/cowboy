const path = require('path');
const { execSync, execFileSync } = require('child_process');
const commandExistsSync = require('command-exists').sync;
const fs = require('fs');

module.exports = class Main {
  /** @type {bool} */
  disableDocker = false;

  /** @type {string} */
  cowboyPath = '';

  /** @type {string} */
  homePath = '';

  /** @type {Array} */
  supportedExtensions = [
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

  constructor(options) {
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

    this.dockerIsAvailable = this.isDockerAvailable();
  }

  isDockerAvailable() {
    // For debugging, could be config driven
    if (this.disableDocker === true) { 
      return false; 
    }

    // Not available from within the docker container
    if (fs.existsSync('/.dockerenv')) { 
      return false; 
    }

    // Ensure the base docker commands are available
    // - docker
    // - docker-compose
    if (commandExistsSync('docker') && commandExistsSync('docker-compose')) { } else {
      return false;
    }

    let response = null;

    try {
      response = this.runThroughDocker('cowboy', ['ping', '--silent']);
    } catch (error) {
      console.log('not sure...')
      console.log(error);
      return false;
    }
  
    return response;
  }

  run(command) {
    const rawExtension = path.extname(command).toLowerCase().trim().replace('.', '');
    const commandName = command.replace(`.${rawExtension}`, '');
    const runAll = rawExtension === 'all';
    const extension = rawExtension.replace('all', '');

    this.debugLog.push(command);

    if (this.dockerIsAvailable) {
      return this.runThroughDocker(command);
    }

    // Execute extension
    if (extension.length > 0) {
      return this.runByExtension(commandName, extension);
    }

    // Need the else to loop through extension types
    // - Find the first executable one, or run all of them
    const responses = [];
    for (const supportedExtension of this.supportedExtensions) {
      if (responses.length > 0 && !runAll) {
        break;
      }

      const extResponses = this.runByExtension(commandName, supportedExtension);
      
      if (extResponses.length > 0) {
        responses.push(extResponses);
      }
    }

    return responses;
  }

  runByExtension(commandName, extension) {
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

    const allowedExtensions = [
      extension
    ];

    for (const dirName of dirNames) {
      const dirPath = `${this.cowboyPath}/modules/${dirName}`
      if (!this.canRead(dirPath)) {
        continue;
      }

      for (const baseName of baseNames) {
        const basePath = `${dirPath}/${baseName}`
        for (const allowedExtension of allowedExtensions) {
          const commandPath = `${basePath}/${baseName}.${allowedExtension}`
          
          if (!this.canExecute(commandPath)) {
            continue;
          }

          const response = this.runCommand(commandPath)
          
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
    try {
      response = response?.toString().trim();
    } catch (error) {
      console.log('Error: Unandled exception. Unable to convert to string!');
      console.log(error);
      process.exit(1);
    }

    if (response === null || response === '') {
      return response;
    }

    try {
      response = JSON.parse(response);
      response = JSON.stringify(response);
      return response;
    } catch (error) {
      return response;
    }
  }

  execSync(cmd, cleanArgv = []) {
    const cmd0 = cmd.split(' ')[0] ?? null;
    let response = null;
    let execFile = false;

    // Safety catch
    if (!cmd0) {
      console.log(`Error: Unhandled exception. Did not expect $cmd0 of ${cmd0} to be false!`);
      process.exit(1);
    }

    // Check if file & executable
    if (this.canExecute(cmd0)) {
      execFile = true;
    }

    // Always append the args to the cmd
    if (cleanArgv != null && cleanArgv.length > 0) {
      cmd = `${cmd} ${cleanArgv.join(' ')}`;
    }

    if (execFile) {
      response = execFileSync(cmd0, cleanArgv, this.execOptions);
    } else {
      response = execSync(cmd, this.execOptions);
    }

    // Always format the response for consistency
    response = this.formatResponse(response);
    
    return response;
  }

  runThroughDocker(cmd, args = [], interactive = false) {
    const command = 'docker-compose';
    const path = this.cowboyPath;
    const projectDir = fs.realpathSync(path);

    const cleanArgv = [
      `--project-directory='${projectDir}'`,
      'exec',
      'cowboy-kali'
    ];

    for (const word of cmd.split(' ')) {
      cleanArgv.push(word)
    }

    for (const arg of args) {
      cleanArgv.push(arg);
    }
    
    return this.execSync(command, cleanArgv);
  }

  appendCommandLog(command, logResponse = null) {
    if (this.options.silent) {
      return;
    }

    // filthy hack
    command = command.includes('cowboy-kali cowboy') ? command : `cowboy ${command}`;

    const commandPath = `${this.cowboyPath}/modules/core/log/log.py`;
    const cleanArgv = [command];

    if (logResponse !== null && logResponse !== '') {
      logResponse = JSON.stringify(logResponse);
      
      const logResponseBase64 = Buffer.from(logResponse, 'utf8').toString('base64');
      cleanArgv.push(`--log-response-base64`);
      cleanArgv.push(logResponseBase64);
    }

    return execFileSync(commandPath, cleanArgv, {
      stdio: 'ignore'
    });
  }

  commandLogMessage(message, logResponse = null) {
    return this.appendCommandLog(message, logResponse)
  }

  commandLorError(message, logResponse = null) {
    return this.appendCommandLog(`${message} --log-name error`, logResponse)
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
    return response;
  }

  runCommand(commandPath) {
    const { argv } = process;

    // To-do: Input sanitation here for sure
    const cleanArgv = argv.slice(3);

    // catch extension exceptions
    const ext = path.extname(commandPath);

    if (ext === '.go') {
      return this.runCommandWithProgram('go run', commandPath, cleanArgv);
    }
  
    return this.execSync(commandPath, cleanArgv);
  }
};
