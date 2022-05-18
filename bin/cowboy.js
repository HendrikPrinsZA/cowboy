#!/usr/bin/env node

const program = require('commander');
const Cowboy = require('../lib/Cowboy');

program
  .option('-v, --verbose', 'output debug information')
  .allowUnknownOption();

program
  .addArgument(new program.Argument('[command]', 'command to run').default('cowboy'))
  .action((command) => {
    const myCowboy = new Cowboy(program.opts());
    const response = myCowboy.run(command);
    myCowboy.command_log(command, response)
  });

program.parse(process.argv);
