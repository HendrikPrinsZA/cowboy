#!/usr/bin/env node
const program = require('commander');
const Queue = require('./lib/Queue');

program
  .addOption(new program.Option('--name <name>', 'The queue to work with').default('cowboy', 'the default queue'))
  .addOption(new program.Option('--message <message>', 'The message').default(null))
  .allowUnknownOption();

program.action(() => {
  const options = program.opts();
  const name = options.name;
  const queue = new Queue(name);

  const message = options.message;
  if (message) {
    queue.append(message)
  }
});

program.parse(process.argv);

// const Queue = require("./lib/Queue");
// const version = process.version;
// const user = process.env.USER || process.env.HOME || process.env.USERPROFILE;
// Queue.append('key1', 'Value1')
// console.log(`Node (${version}): Hello World, I am ${user}!`);

// process.exit(0)

// this.rifle = new Rifle()
// Queue.addAmmo();

// Queue.append('test1 1 2 3')