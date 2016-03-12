var co = require('co');
var HTTPError = require('node-http-error');

describe('serverErrorHandlerMiddleware()', function () {
  it('must throw non HTTPError in production', function (done) {
    var handler = this.require('middlewares/server_error_handler');
    var context = {logger: new this.TestLogger()};
    var err = new Error();
    context.handler = handler;
    process.env.APP_ENV = 'prod';
    co(context.handler(function () { throw err })).then(() => {
      fail('must throw the error in production');
      done();
    }).catch(function () {
      done();
    });
  });

  it('must return the error to the client in non production', function (done) {
    var handler = this.require('middlewares/server_error_handler');
    var context = {logger: new this.TestLogger()};
    var err = new Error();
    context.handler = handler;
    process.env.APP_ENV = 'dev';
    co(context.handler(function () { throw err })).then(() => {
      expect(context.body).toEqual(jasmine.any(String));
      expect(context.status).toBe(500);
      done();
    }).catch(function (reason) {
      fail(`shouldn't raise the error: ${reason}`);
      done();
    });
  });

  it('must return the HTTPError to the client event in production mode', function (done) {
    var handler = this.require('middlewares/server_error_handler');
    var context = {logger: new this.TestLogger()};
    context.handler = handler;
    process.env.APP_ENV = 'dev';
    co(context.handler(function () { throw new HTTPError(403, 'you are a stupid client') })).then(() => {
      expect(context.body).toBe('you are a stupid client');
      expect(context.status).toBe(403);
      done();
    }).catch(function (reason) {
      fail(`shouldn't raise the error: ${reason}`);
      done();
    });
  });

  it('deos not overwrite status', function (done) {
    var handler = this.require('middlewares/server_error_handler');
    var context = {logger: new this.TestLogger(), status: 600};
    context.handler = handler;
    process.env.APP_ENV = 'dev';
    co(context.handler(function () { throw new HTTPError(403, 'you are a stupid client') })).then(() => {
      expect(context.body).toBe('you are a stupid client');
      expect(context.status).toBe(600);
      done();
    }).catch(function (reason) {
      fail(`shouldn't raise the error: ${reason}`);
      done();
    });
  });
});
