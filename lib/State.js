const JSONdb = require('simple-json-db');
const { getStoragePath, hrtimeToStr } = require('./helpers');

const TIMESTART = process.hrtime();

module.exports = class State {
  constructor(poolId, debugEnabled = false) {
    this.poolId = poolId;
    this.threadId = hrtimeToStr(TIMESTART);
    this.debugEnabled = debugEnabled;

    this.databasePath = `${getStoragePath()}/states/${this.threadId}.json`;
    this.db = new JSONdb(this.databasePath);

    this.benchmark_timestamp = null;
  }

  get(key, def = null) {
    if (this.db.has(key)) {
      return this.db.get(key) ?? def;
    }

    return def;
  }

  set(key, value) {
    this.db.set(key, value);
    
    // (future note) potential bottleneck
    // a) merge and save on destruct
    // b) use shared memory (db, cache)
    this.db.sync();

    return true;
  }

  benchmarkMark() {
    this.benchmark_timestamp = Date.now();
  }

  benchmark(label) {
    if (!this.debugEnabled) {
      return;
    }

    const key = 'pools';
    const pools = this.get(key, {})
    const timestamp = Date.now();

    // Fuck JS
    if (!pools[this.poolId]) { 
      pools[this.poolId] = {
        id: this.poolId,
        created_at: timestamp,
        updated_at: timestamp,
        duration: 0,
        threads: {},
      }; 
    }

    if (!pools[this.poolId].threads[this.threadId]) { 
      pools[this.poolId].threads[this.threadId] = {
        id: this.threadId,
        created_at: timestamp,
        updated_at: timestamp,
        entries: [],
      }; 
    }

    // Ref
    const entries_ref = pools[this.poolId].threads[this.threadId].entries;
    const relative_time_ms = this.benchmark_timestamp !== null 
      ? timestamp - this.benchmark_timestamp
      : timestamp - pools[this.poolId].threads[this.threadId].updated_at;

    entries_ref.push({
      label: label,
      created_at: timestamp,
      pool_time_ms: timestamp - pools[this.poolId].created_at,
      thread_time_ms: timestamp - pools[this.poolId].threads[this.threadId].created_at,
      relative_time_ms: relative_time_ms
    });

    // Updates
    pools[this.poolId].updated_at = timestamp;
    pools[this.poolId].threads[this.threadId].updated_at = timestamp;

    // Calculations
    pools[this.poolId].duration_ms = pools[this.poolId].updated_at - pools[this.poolId].created_at;
    pools[this.poolId].threads[this.threadId].duration_ms = pools[this.poolId].threads[this.threadId].updated_at - pools[this.poolId].threads[this.threadId].created_at;

    // Always clear the mark
    this.benchmark_mark = null;

    this.set(key, pools);
  }
}
