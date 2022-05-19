'use strict';

import express from 'express';
import expressWs from 'express-ws';
import http from 'http';
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// trim, rtrim, ltrim
function trim(str, chr) {
  var rgxtrim = (!chr) ? new RegExp('^\\s+|\\s+$', 'g') : new RegExp('^'+chr+'+|'+chr+'+$', 'g');
  return str.replace(rgxtrim, '');
}
// function rtrim(str, chr) {
//   var rgxtrim = (!chr) ? new RegExp('\\s+$') : new RegExp(chr+'+$');
//   return str.replace(rgxtrim, '');
// }
function ltrim(str, chr) {
  var rgxtrim = (!chr) ? new RegExp('^\\s+') : new RegExp('^'+chr+'+');
  return str.replace(rgxtrim, '');
}

class Api {
  
  constructor() {
    console.log('Initialized Api');

    // Paths 
    this.dirname = path.dirname(__filename);
    this.basepath = path.resolve(`${this.dirname}/../../../..`);

    // Configs
    this.port = 3000;
    this.skip = {};
  }

  start() {
    // Create
    this.app = express();
    this.server = http.createServer(this.app).listen(this.port);
    this.expressWs = expressWs(this.app, this.server);

    // Instantiate
    this.routes();
    this.views();
    this.sockets();
  }

  routes() {
    this.app.get('/', (req, res) => {
      res.status(200).send("Welcome to the cowboy Node API");
    });
  }

  // Not sure what this is about tbh...
  views() {
    this.app.use(express.static(this.dirname + '/views'));
  }

  respond(wsHandler, response) {
    if (typeof response === 'string') {
      response = {
        message: response
      };
    }

    if (response.success !== false) {
      response.success = true;
    }

    return wsHandler.send(JSON.stringify(response));
  }

  error(wsHandler, message) {
    return this.respond(wsHandler, {
      success: false,
      message: message
    });
  }

  asbPathToRelPath(asbPath) {
    return trim(asbPath.replace(this.basepath, ''), '/');
  }

  parseMessage(message) {
    const type = typeof message;
    if (type !== 'string') {
      console.error(`Unexpected message type of ${type}: '${message}'`);
      return false;
    }

    try {
      return JSON.parse(message);
    } catch (error) {
      console.error(`Unable to parse message to JSON: '${message}'`);
      return false;
    }
  }

  getDirectories(targetPath) {
    const logDirs = [];
    const targetPathAbs = `${this.basepath}/${targetPath}`;
    const dirPaths = fs.readdirSync(targetPathAbs);

    for (const dirPath of dirPaths) {
      const dirPathAbs = `${targetPathAbs}/${dirPath}`;

      if (dirPath.startsWith('.') || dirPath.includes('.')) {
        continue;
      }

      if (!fs.lstatSync(dirPathAbs).isDirectory()) {
        continue;
      }

      logDirs.push({
        name: path.basename(dirPathAbs),
        path: this.asbPathToRelPath(dirPathAbs),
        files: []
      });

      // const filePaths = fs.readdirSync(dirPathAbs);
      // for (const filePath of filePaths) {
      //   console.log({
      //     filePath: filePath
      //   });

      //   if (filePath.startsWith('.') || !filePath.includes('.')) {
      //     continue;
      //   }
        
      //   logDir.files.push({
      //     name: path.basename(filePath),
      //     path: filePath
      //   });
      // }
    }

    return logDirs;
  }

  watch(wsHandler, message) {
    const me = this;
    let targetPath = message.path ?? null;

    if (targetPath === null) {
      return me.error(wsHandler, "Expected param 'path' not found!");
    }

    // Strip dash and dotdash to fix the path
    targetPath = ltrim(ltrim(targetPath, '/'), './');

    if (targetPath.startsWith('/')) {
      console.log('ERROR: HOW THE FUCK?');
      process.exit(1);
    }

    let pathExists = false;
    targetPath = path.resolve(`${this.basepath}/${targetPath}`)
    try {
      pathExists = fs.realpathSync(targetPath);
    } catch (error) {
      pathExists = false;
    }
    
    if (!pathExists) {
      return me.error(wsHandler, `Path not found: ${targetPath}`);
    }

    return me.watchPath(wsHandler, targetPath);
  }

  watchPath(wsHandler, targetPath) {
    const me = this;
    const skipKey = `Listening on ${targetPath}`;
    const targetPathRel = me.asbPathToRelPath(targetPath)

    me.respond(wsHandler, `Listening on path: ${targetPathRel}`);
    me.respond(wsHandler, { 
      debug: true, 
      directories: me.getDirectories(targetPathRel),
      path: targetPathRel,
    });
    me.skip[skipKey] = true;

    // Clear after first 1sec
    setTimeout(() => {
      me.skip[skipKey] = false;
    }, 1000);

    // chokidar.watch(targetPath).on('all', (event, path) => {
    chokidar.watch(targetPath, {
      ignoreInitial: true,
      ignored: [
        '**/cowboy/modules/core/api/**',
        '**/node_modules/**',
        '**/vendor/**',
        '*.cache',
        '.DS_STORE',
      ],
      followSymlinks: false,
      depth: 10,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      },
    }).on('all', (event, path) => {
      if (me.skip[skipKey]) {
        return;
      }
      
      me.respond(wsHandler, { 
        debug: true, 
        directories: me.getDirectories(targetPathRel),
        path: targetPathRel,
      });
      me.respond(wsHandler, { event: event, path: path });
    });
  }

  sockets() {
    const me = this;
    
    // Shows the current log directories
    // - To-do: Authentication middleware on the req object (2nd param)?
    this.app.ws('/ws', async function(ws) {

      ws.on('message', async (message) => {
        message = me.parseMessage(message);        
        if (message === null) {
          me.error(ws, `Unable to parse the message: ${message}`);
        }

        const action = message.action ?? null;
        if (action === 'watch') {
          return me.watch(ws, message);
        }
      });
    });

  }
}

export default Api;