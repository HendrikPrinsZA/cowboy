#!/usr/bin/env node

const program = require('commander');
const Cowboy = require('../lib/Cowboy');

const myCowboy = new Cowboy();

program
  .option('-v, --verbose', 'output debug information')
  .allowUnknownOption();

program
  .addArgument(new program.Argument('[command]', 'command to run').default('cowboy'))
  .action((command) => {
    myCowboy.run(command);
  });

program.parse(process.argv);
