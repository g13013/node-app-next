'use strict';

const winston = require('winston');
var level = process.env.LOG_LEVEL || 'silent';

var TestLogger = jasmine.createSpy().and.callFake(function () {
  var logger = new winston.Logger({transports: [new winston.transports.Console({level: level})]});
  logger.prefix = 'TestLogger';
  return logger;
});


beforeEach(function () {
  this.TestLogger = TestLogger;
})

module.exports = TestLogger;
