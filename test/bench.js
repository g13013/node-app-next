'use strict';

/*eslint-disable no-unused-vars*/

var fs = require('fs');
var path = require('path');
var Suite = new require('benchmark').Suite;
var FsNode = require('fs-node');
var suites = [];

var suiteName = process.argv[2];

function reportError(event) {
  console.log(event.target.name, 'Error:', event.target.error.message); //eslint-disable-line no-console
}

function reportCycle(event) {
  if (!event.target.error) {
    console.log(String(event.target)); //eslint-disable-line no-console
  }
}

function reportFastest() {
  console.log(`Fastest is ${this.filter('fastest').map('name')}\n`); //eslint-disable-line no-console
}

for (let bench of new FsNode(`${__dirname}/bench`)) {
  if (suiteName && bench.basename !== suiteName) {
    continue;
  }
  let suite;
  let benchMod = require(`./bench/${bench.basename}`);
  for (let key in benchMod) {
    let fn = benchMod[key];
    if (benchMod.hasOwnProperty(key) && typeof fn === 'function') {
      suite = suite || new Suite();
      suite.add(`${bench.basename} - ${key}`, fn);
    }
  }

  if (suite) {
    suite.on('cycle', reportCycle)
         .on('complete', reportFastest)
         .on('error', reportError);

    suites.push(suite);
  }
}

suites.forEach((suite) => {
  suite.run({async: false});
});
