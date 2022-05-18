const path = require('path');
const { execSync, execFileSync } = require('child_process');
const fs = require('fs');

module.exports = class Main {
  /** @type {bool} */
  disableDocker = true; // Default should be false

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
    'sh',
    'ts',
  ];

  constructor(options) {
    this.hostname = 'ghostname';

    this.options = options;
    this.homePath = this.getHomePath();
    this.cowboyPath = this.getCowboyPath();
    this.hostname = process.env.HOST_NAME;
    this.execOptions = {
      stdio: 'inherit'
    };

    if (this.hostname?.length > 0) { } else {
      this.hostname = execSync('echo "$HOST_NAME"', this.execOptions);
    }

    this.dockerIsAvailable = this.isDockerAvailable();
  }

  isDockerAvailable() {
    if (this.disableDocker) {
      return false;
    }

    if (this.hostname == 'cowboy.local') {
      return false;
    }

    if (this.isUp()) {
      return true;
    }
  }

  run(command) {
    const rawExtension = path.extname(command).toLowerCase().trim().replace('.', '');
    const commandName = command.replace(`.${rawExtension}`, '')
    const runAll = rawExtension === 'all';
    const extension = rawExtension.replace('all', '')

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
          responses.push({
            command: commandPath,
            response: response
          });
        }
      }
    }

    return responses;
  }

  formatRespose(response) {
    if (response === null || response == '') {
      return null;
    }

    try {
      response = response.toString().trim();
    } catch (error) {
      console.log('Unable to convert to string');
      process.exit(1);
    }

    if (response == '') {
      return response;
    }

    try {
      response = JSON.parse(response);
      response = JSON.stringify(response);
    } catch (error) {}

    return response;
  }

  execSync(cmd, cleanArgv = []) {
    let response = null;

    // Always append the args to the cmd
    if (cleanArgv != null && cleanArgv.length > 0) {
      cmd = `${cmd} ${cleanArgv.join(' ')}`;
    }

    try {
      response = execSync(cmd, this.execOptions);
      response = this.formatRespose(response);
      this.command_log_message(cmd, response);
      return response;
    } catch (error) {;
      this.command_log_error(cmd, error.toString().trim());
      process.exit(1);
    }
  }

  runThroughDocker(cmd, args = [], interactive = false) {
    const command = 'docker-compose';
    const path = this.cowboyPath.toString();
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

  isUp() {
    let response = '';

    try {
      response = this.runThroughDocker('cowboy ping');
    } catch (error) { 
      console.log('not sure...')
      return false;
    }
  
    try {
      response = response.length > 0 
        ? JSON.parse(response)
        : response;

      return response.success;
    } catch (error) {
      return false;
    }
  }

  launchEnvironment() {
    let path = this.cowboyPath.toString();
    const projectDir = fs.realpathSync(path);
    const command = `docker-compose --project-directory '${projectDir}' up -d`;
    return this.execSync(command);
  }

  command_log(command, logResponse = null) {
    const commandPath = `${this.cowboyPath}/modules/core/log/log.py`;
    const cleanArgv = [command];

    if (logResponse !== null && logResponse !== '') {
      logResponse = JSON.stringify(logResponse);
      
      const logResponseBase64 = Buffer.from(logResponse, 'utf8').toString('base64');
      cleanArgv.push(`--log-response-base64`);
      cleanArgv.push(logResponseBase64);
    }

    console.log({
      commandPath: commandPath,
      command: command,
      cleanArgv: cleanArgv,
    });

    return execFileSync(commandPath, cleanArgv, {
      stdio: 'ignore'
    });
  }

  command_log_message(message, logResponse = null) {
    return this.command_log(message, logResponse)
  }

  command_log_error(message, logResponse = null) {
    return this.command_log(`${message} --log-name error`, logResponse)
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

    if (ext === '.php') {
      return this.runCommandWithProgram('php', commandPath, cleanArgv);
    }

    if (ext === '.go') {
      return this.runCommandWithProgram('go run', commandPath, cleanArgv);
    }

    if (this.canExecute(commandPath)) {
      return execFileSync(commandPath, cleanArgv, {
        stdio: 'inherit',
      });
    }
  
    return this.execSync(commandPath, cleanArgv);
  }
};
