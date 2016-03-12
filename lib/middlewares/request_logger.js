'use strict';

function* requestLoggerMiddleware(next) {
  let start = process.hrtime();
  yield next;
  let elapsed = (process.hrtime(start)[1] / 1000000).toFixed(2);
  this.logger.info(`[${this.status}] ${this.method} => ${this.path} (${elapsed} ms)`);
}

module.exports = requestLoggerMiddleware;
