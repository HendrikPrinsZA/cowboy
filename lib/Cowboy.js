const path = require('path');
const prompt = require('prompt');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

module.exports = class Main {
  /** @type {bool} */
  detached = false;

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

  constructor() {
    this.homePath = this.getHomePath();
    this.cowboyPath = this.getCowboyPath();
    this.cowboyModulePath = `${this.cowboyPath}/modules`

    const hostname = execSync('echo "$HOST_NAME"').toString().trim();
    if (hostname === 'cowboy.local') {
      return;
    }

    if (this.isUp()) { return; }

    console.log('Launching environment...');
    const response = this.launchEnvironment();
    if (this.isUp()) {
      return;
    } else {
      console.log('Error: unable to launch environment');
      console.log(response.toString())
    }
  }

  runThroughDocker(command) {
    const commandPrefix = `docker exec cowboy-kali`;
    const commandFull = `${commandPrefix} cowboy ${command}`;
    const response = execSync(commandFull).toString();
    console.log(response);
    return response.toString().trim();
  }

  isUp() {
    const command = `docker exec cowboy-kali cowboy ping`
    try {
      const response = execSync(command).toString();
      const json = JSON.parse(response);
      if (json.success) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  launchEnvironment() {
    let path = `${this.cowboyPath}`.toString();
    const projectDir = fs.realpathSync(path);
    const command = `docker-compose --project-directory='${projectDir}' up -d`;
    const response = execSync(command)
    return response;
  }

  runByExtension(commandName, extension) {
    const commandPaths = [
      `${this.cowboyModulePath}/local/${commandName}/${commandName}.${extension}`,
      `${this.cowboyModulePath}/core/${commandName}/${commandName}.${extension}`,
      `${this.cowboyModulePath}/public/${commandName}/${commandName}.${extension}`,
    ];

    for (const commandPath of commandPaths) {
      let permissions = this.getPermissions(commandPath);

      if (!permissions.canRead) {
        continue; 
      }

      if (!permissions.canExecute) {
        // It exists, so make sure it is executable
        fs.chmodSync(commandPath, 0o755);
      }

      permissions = this.getPermissions(commandPath);

      if (!permissions.canExecute) {
        console.warn(`Warning: Command path found, but not executable. Trying to change permissions on ${commandPath}...`);
        continue;
      }

      try {
        const command = commandPath;
        const response = this.runCommand(command);
        return response;
      } catch (error) {
        console.warn(`Warning: Something bad happened here: ${commandPath}\n\nCheck the permissions!`);
        return false;
      }
    }

    return false;
  }

  // Run shit
  async run(command) {
    const rawExtension = path.extname(command).toLowerCase().trim().replace('.', '');
    const commandName = command.replace(`.${rawExtension}`, '')
    const runAll = rawExtension === 'all';
    const extension = rawExtension.replace('all', '')

    if (os.hostname() !== 'cowboy.local') {
      return this.runThroughDocker(command);
    }

    if (extension.length > 0) {
      return this.runByExtension(commandName, extension);
    }

    // Need the else to loop through extension types
    // - Find the first executable one, or run all of them
    const responses = [];
    for (const supportedExtension of this.supportedExtensions) {
      const response = this.runByExtension(commandName, supportedExtension);
      if (response === false) {
        continue;
      }

      if (!runAll) {
        return response;
      }

      responses.push(response);
    }

    return responses;
  }

  getCowboyPath() {
    const baseName = path.basename(__dirname);
    return __dirname.replace(`/${baseName}`, '');
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

  runCommandWithExec(execPath, commandPath, cleanArgv) {
    try {
      const command = `${execPath} ${commandPath} ${cleanArgv}`;
      const response = execSync(command).toString();
      console.log(response);
      return response;
    } catch (err) {
      console.warn('Some random error', err);
      process.exit(1);
    }
  }

  runCommandDirect(commandPath) {
    const { argv } = process;

    const shell = spawn(commandPath, argv.slice(3), { stdio: 'inherit' });
    shell.on('close', (code) => {
      if (code !== 0) {
        console.error('Something went wrong!', code);
        process.exit(code);
      }
    })

    shell.on('error', (error) => {
      console.error(`Unhandled exception: ${error}`, error);
      process.exit(1);
    })
    
    return true;
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

    if (ext === '.go') {
      return this.runCommandWithExec('go run', commandPath, cleanArgv);
    }
    
    return this.runCommandDirect(commandPath, cleanArgv);
  }
};
