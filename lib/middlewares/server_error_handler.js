'use strict';

const HTTPError =  require('node-http-error');
const env = require('../helpers/env');

function * serverErrorHandlerMiddleware(next) {
  Object.defineProperty(this, 'errors', {value: []});

  try {
    yield next;
  } catch (err) {
    this.errors.push(err);

    if (err instanceof HTTPError) {
      this.body = err.message;
      this.status = this.status || err.status;
    } else {
      if (env.production) {
        throw err;
      }

      this.logger.error(err.message);
      this.logger.debug(err.stack);
      this.body = `${err.message}\n${err.stack}`;
      this.status = 500;
    }
  }
}

module.exports = serverErrorHandlerMiddleware
