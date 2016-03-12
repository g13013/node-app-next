'use strict';

var KoaApplication = require('koa');
var Logger = require('./logger');

class Server extends KoaApplication {
  constructor(config) {
    super();
    this.config = config || {};
    this.logger = new Logger('Server');
    this.on('error', (err, ctx) => {
      this.logger.error(`router error: ${err} [${ctx.req.method}]${ctx.req.url}`, err.stack)
      this.logger.debug('Error context: ', ctx);
    });
  }

  start () {
    if (this.server) {
      return this;
    }

    var port = this.config.port || 4000
    this.server = this.listen(port);
    this.logger.info('listening on port', port);

    return this;
  }

  stop () {
    if (!this.server) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.logger.info('stoping the server');
      this.server.close(() => {
        delete this.server;
        this.logger.info('server stopped');
        resolve()
      });
    });
  }
}

module.exports = exports = Server;
