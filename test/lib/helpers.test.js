const assert = require('assert');
const { describe, it } = require('mocha');
const { convertResponse } = require('../../lib/helpers');

describe('Sample', () => {
  it('safely parse responses', () => {
    const samples = [
      [
        null,
        null
      ],
      [
        'PHP (8.1.5): Hello World!\n',
        'PHP (8.1.5): Hello World!\n'
      ],
    ];

    for (sample of samples) {
      const response = sample[0];
      const expected = sample[1];
      const actual = convertResponse(response);

      assert.equal(actual, expected);
    }
  });
});
