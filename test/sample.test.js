const assert = require('assert');
const { describe, it } = require('mocha');

describe('Sample', () => {
  it('should return -1 when the value is not present', () => {
    assert.equal([1, 2, 3].indexOf(4), -1);
  });
});
