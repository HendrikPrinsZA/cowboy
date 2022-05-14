const path = require('path');
const prompt = require('prompt');
const { execSync, spawn, execFileSync } = require('child_process');
const fs = require('fs');
// const { exit } = require('process');

module.exports = class Main {
  /** @type {bool} */
  detached = false;

  /** @type {string} */
  codePath = '';

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
    this.codePath = this.getCodePath();

    if (!this.isUp()) {
      this.launchEnvironment();
    }
    // const response = this.launchEnvironment();
    // console.log({
    //   fn: 'Cowboy.contructor',
    //   response: `response: ${response}`
    // });
    // process.exit(1)

  }

  isUp() {
    const command = `docker exec cowboy-kali echo 'hi'`
    try {
      const response = execSync(command).toString();
      // console.log({
      //   fn: 'isUp = True',
      //   response: response.toString()
      // })
      return response
    } catch (error) {
      // console.log({
      //   fn: 'isUp = False',
      //   error: error
      // })
      return false;
    }
  }

  launchEnvironment(rebuild = false) {
    let path = `${this.codePath}/..`.toString();
    const projectDir = fs.realpathSync(path);
    const command = `docker-compose --project-directory='${projectDir}' up`;
    const response = execSync(command)
    console.log({
      command,
      response
    })
    return response;
  }

  async runByExtension(commandName, extension) {
    const commandPaths = [
      `${this.codePath}/local/${commandName}/${commandName}.${extension}`,
      `${this.codePath}/core/${commandName}/${commandName}.${extension}`,
      `${this.codePath}/public/${commandName}/${commandName}.${extension}`,
    ]

    if (extension === 'all') {
      console.warn('Warning: Support for all in progress...')
      return false;
    }

    for (const commandPath of commandPaths) {

      let permissions = this.getPermissions(commandPath);

      if (!permissions.canRead) {
        // Ok to skip, not available!
        continue;
      }

      if (!permissions.canExecute) {
        console.warn(`Warning: Command path found, but not executable. Trying to change permissions on ${commandPath}...`);
        fs.chmodSync(commandPath, 0o755);
        permissions = this.getPermissions(commandPath);
      }

      if (!permissions.canExecute) {
        console.error(`Unable to change permissions for ${commandPath}`);
        process.exit(1)
      }

      try {
        const response = await this.runCommand(commandPath);  
        return response;
      } catch (error) {
        console.warn(`Warning: Something bad happened here: ${commandPath}\n\nMost likely permissions!`);
        return false;
      }
    }
  }

  // Run shit
  async run(command) {
    const rawExtension = path.extname(command).toLowerCase().trim().replace('.', '');
    const commandName = command.replace(`.${rawExtension}`, '')
    const runAll = rawExtension === 'all';
    const extension = rawExtension.replace('all', '')

    if (extension.length > 0) {
      return this.runByExtension(commandName, extension);
    }

    // Need the else to loop through extension types
    // - Find the first executable one, or run all of them
    const responses = [];
    for (const supportedExtension of this.supportedExtensions) {
      const response = this.runByExtension(commandName, supportedExtension);
      if (!runAll) {
        return response;
      }
      
      responses.push(response);
    }

    return responses;
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
      const res = execSync(`${execPath} ${commandPath} ${cleanArgv}`);
      console.log(res.toString());
    } catch (err) {
      // Might not be req...?
      // console.log(err.stderr.toString());
      console.warn('Some random error', err);
      process.exit(1);
    }
  }

  runCommandDirect(commandPath) {
    const { argv } = process;

    // To-do: Further debugging req here
    // - Not sure about executing commands directly, for ex) cowboy random1 (create new)
    // console.log(`fn: runCommandDirect, commandPath: ${commandPath}`)

    if (!this.canExecute(commandPath)) {
      console.warn(`Warning: Command found, but not executable: ${commandPath}`);
      return false;
    }

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
