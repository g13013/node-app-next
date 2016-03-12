
describe('Server', function () {
  var Server;

  beforeEach(function () {
    Server = this.require('server');
  });

  it('#constructor()', function () {
    var cfg = {};
    var server = new Server(cfg);
    spyOn(server.logger, 'error');
    server.emit('error', 'arg1', {req: {method: 'get', 'url': 'htt...'}});
    expect(server.logger.error).toHaveBeenCalled();
    expect(server.config).toEqual(cfg);
    expect(new Server().config).toEqual({});
  });

  it('#start()', function () {
    var server = new Server({port: 5400});
    var ins = {};
    spyOn(server, 'listen').and.returnValues(ins, {});
    expect(server.start()).toBe(server);
    expect(server.listen).toHaveBeenCalledWith(5400);
    expect(server.server).toBe(ins);
    server.start()
    expect(server.server).toBe(ins);
    server.config.port = null;
    server.server = null;
    server.start()
    expect(server.listen).toHaveBeenCalledWith(4000);
  });

  describe('#stop()', function () {
    it('resolves directly if not up', function () {

      spyOn(global.Promise, 'resolve').and.returnValue('directly resolved');
      var server = new Server({port: 5400});
      expect(server.stop()).toBe('directly resolved');
    });

    it('return promise and resolves when finish', function () {
      spyOn(global, 'Promise');
      var server = new Server({port: 5400});
      var close = jasmine.createSpy('server.close');
      server.server = {close: close}
      var resolve = jasmine.createSpy('resolve');
      server.server.close.and.callFake((cb) => cb());
      Promise.and.callFake((cb) => {cb(resolve)});
      server.stop();
      expect(Promise).toHaveBeenCalledWith(jasmine.any(Function));
      expect(close).toHaveBeenCalledWith(jasmine.any(Function));
      expect(server.server).toBe(undefined);
      expect(resolve).toHaveBeenCalled();
    });

    it('resolves even on error', function () {
      spyOn(global, 'Promise');
      var server = new Server({port: 5400});
      var close = jasmine.createSpy('server.close');
      server.server = {close: close}
      var resolve = jasmine.createSpy('resolve');
      server.server.close.and.callFake((cb) => cb({}));
      Promise.and.callFake((cb) => {cb(resolve)});
      server.stop();
      expect(Promise).toHaveBeenCalledWith(jasmine.any(Function));
      expect(close).toHaveBeenCalledWith(jasmine.any(Function));
      expect(server.server).toBe(undefined);
      expect(resolve).toHaveBeenCalled();
    });
  });
});
