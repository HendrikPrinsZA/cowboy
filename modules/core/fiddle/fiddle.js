#!/usr/bin/env node

const version = process.version;
const user = process.env.USER || process.env.HOME || process.env.USERPROFILE;

console.log(`Node (${version}): Hello World, I am ${user}!`);
