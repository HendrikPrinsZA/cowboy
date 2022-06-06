#!/usr/bin/env node

const program = require('commander');
const Cowboy = require('../lib/Cowboy');

program
  .option('-v, --verbose', 'output debug information')
  .option('-s, --silent', 'run silently')
  .option('--pool-id <string>', 'unique id for pooling')
  .option('--benchmark', 'runs in benchmark mode')
  .allowUnknownOption();

program
  .addArgument(new program.Argument('[command]', 'command to run').default('cowboy'))
  .action((command) => {
    const cowboy = new Cowboy(program.opts());
    const responses = cowboy.run(command);
    if (responses && responses.length > 0) {
      cowboy.logMessage(responses);
    }
  });

program.parse(process.argv);
