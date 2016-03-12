//var co = require('co');

describe('requestLoggerMiddleware()', function () {
  it('request logging', function () {
    var context = {logger: jasmine.createSpyObj('logger', ['warn', 'info', 'error']), path: 'url_path', method: 'PUT', status: 3000};
    context.fn = this.require('middlewares/request_logger');
    var nextArg = {};
    var iterator = context.fn(nextArg);
    expect(iterator.next()).toEqual({value: nextArg, done: false});
    expect(iterator.next()).toEqual({value: undefined, done: true});
    expect(context.logger.info.calls.count()).toBe(1);
    var log = context.logger.info.calls.first().args[0];
    expect(/3000/.test(log)).toBe(true);
    expect(/PUT/.test(log)).toBe(true);
    expect(/url_path/.test(log)).toBe(true);
    expect(/(\d+) ?ms/.test(log)).toBe(true);
  })
})
