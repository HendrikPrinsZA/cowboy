// const { join, dirname } = require("lowdb/path");
// import { LowSync, JSONFileSync } from "lowd";
// const { fileURLToPath } = require("lowdb/url");

// const { join, dirname } = require('lowdb')

// const __dirname = dirname(fileURLToPath(import.meta.url));

module.exports = class State {
  constructor() {
    // const __dirname = dirname(fileURLToPath(import.meta.url));
    // const file = './cowboy.db.json';
    // const adapter = new JSONFile(file);
    // this.db = new Low(adapter);

    // this.db = new LowSync(new JSONFileSync('file.json'))
    
    // this.timestamp = Date.now();
    // this.db.data.logs.push({
    //   timestamp: timestamp,
    //   message: 'State.constructor()'
    // });
    // this.db.write()
  }

  bench(label) {
    return label;
  }

  // getBenchmarkInfo() {
  //   if (!this.benchmarkData.entries[key]) {
  //     this.benchmarkData.entries[key] = [];
  //   }

  //   // const elapsed_hrtime = process.hrtime(this.benchmarkData.hrtime);
  //   const elapsed_hrtime = process.hrtime(TIMESTART);
  //   const entry = {
  //     label: label,
  //     hrtime: this.benchmarkData.hrtime,
  //     elapsed_hrtime: elapsed_hrtime,
  //     elapsed_ms: (elapsed_hrtime / 1000000),
  //     elapsed_pretty: pretty(elapsed_hrtime, '')
  //   };

  //   this.benchmarkData.entries[key].push(entry);
  //   // this.benchmarkData.timestamp = process.hrtime(this.benchmarkData.timestamp);

  //   // Debugging
  //   console.log(emoji.emojify(`:face_with_cowboy_hat: | ${entry.elapsed_pretty.padStart(6)} | ${entry.label}`))
  // }
}
