#!/usr/bin/env node

const program = require('commander');
const Cowboy = require('../lib/Cowboy');

program
  .option('-v, --verbose', 'output debug information')
  .option('-s, --silent', 'run silently')
  .allowUnknownOption();

program
  .addArgument(new program.Argument('[command]', 'command to run').default('cowboy'))
  .action((command) => {
    const myCowboy = new Cowboy(program.opts());
    const responses = myCowboy.run(command);

    if (responses.length > 0) {
      myCowboy.commandLog(command, responses)
    }
  });

program.parse(process.argv);
