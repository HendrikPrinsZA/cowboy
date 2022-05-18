#!/usr/bin/env node

// const Queue = require("./lib/Queue");

const version = process.version;
const user = process.env.USER || process.env.HOME || process.env.USERPROFILE;

console.log(`Node (${version}): Hello World, I am ${user}!`);

process.exit(0)

// this.rifle = new Rifle()
// Queue.addAmmo();
