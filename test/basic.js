'use strict';

const chai = require('chai');

const lib = require('../lib');

const expect = chai.expect;

describe('basic', () => {
  it('lib is object', async () => {
    expect(lib).to.be.an('object');
  });
});

/* eslint-env mocha */
