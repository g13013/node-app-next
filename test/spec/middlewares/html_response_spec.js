var htmlResponseMiddleware = require(global.LIB_DIR + '/middlewares/html_response.js');
var co = require('co');

describe('#htmlResponseMiddleware', function () {
  it('this.html without this.body', function (done) {
    var context = {
      htmlResponseMiddleware: htmlResponseMiddleware,
      handler: function * handler() {
        expect('html' in context).toBe(true, `html key must be defined got: ${context}`);
        context.html = 'inner html';
        yield {};
      },
      set: jasmine.createSpy(), body: null
    };



    co(context.htmlResponseMiddleware(context.handler)).then(function () {
      expect(context.html).toBe('inner html');
      expect(context.set).toHaveBeenCalledWith('Content-Type', 'text/html');
      expect(context.body).toEqual(jasmine.any(String));
      expect(context.body.indexOf('inner html')).not.toBe(-1);
      done();
    }).catch(function (err) {
      fail(`shouldn't with error: ${err}`);
      done();
    })
  });

  it('this.html with this.body', function (done) {
    var body = {};
    var context = {
      htmlResponseMiddleware: htmlResponseMiddleware,
      handler: function * handler() {
        expect('html' in context).toBe(true, `html key must be defined got: ${context}`);
        context.html = '1';
        context.body = body;
        yield {};
      },
      set: jasmine.createSpy(), body: null
    };



    co(context.htmlResponseMiddleware(context.handler)).then(function () {
      expect(context.html).toBe('1');
      expect(context.set).not.toHaveBeenCalledWith('Content-Type', 'text/html');
      expect(context.body).toEqual(body);
      done();
    }).catch(function (err) {
      fail(`shouldn't with error: ${err}`);
      done();
    })
  });
});
