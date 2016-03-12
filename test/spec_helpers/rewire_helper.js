'use strict';

const rewire = require('rewire');
const path = require('path');

function reloadModule(mod) {
  return rewire(path.resolve(global.LIB_DIR, mod));
}

beforeEach(function () {
  this.require = reloadModule;
})
