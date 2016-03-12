var modulePath = global.LIB_DIR + '/logger';
var Logger = require(modulePath);
var winston = require('winston');
var rewire = require('rewire');


describe('Logger', function () {
  describe('#constructor', function () {
    it('calls super winston.Logger', function () {
      spyOn(winston, 'Logger');
      var Logger = rewire(modulePath);
      new Logger();
      expect(winston.Logger).toHaveBeenCalledWith({transports: Logger.transports});
    });

    it('sets global transports when no transports and useGlobal !== false', function () {
      spyOn(winston, 'Logger');
      var Logger = rewire(modulePath);
      var obj = {transports: Logger.transports};
      new Logger({});
      expect(winston.Logger).toHaveBeenCalledWith(obj);
      winston.Logger.calls.reset();
      new Logger({useGlobalTransports: false});
      expect(winston.Logger).toHaveBeenCalledWith({useGlobalTransports: false});
    });

    it('calls setupTransports if transports is defined', function () {
      spyOn(winston, 'Logger');
      var Logger = rewire(modulePath);
      var obj = {transports: {file: true}};
      spyOn(Logger, 'setupTransports');
      new Logger(obj);
      expect(Logger.setupTransports).toHaveBeenCalledWith({file: true}, []);
    });

    it('calls super winston.Logger with submitted object', function () {
      spyOn(winston, 'Logger');
      var obj = {};
      var Logger = rewire(modulePath);
      new Logger(obj);
      expect(winston.Logger).toHaveBeenCalledWith(obj);
    });

    it('sets the prefix if second arg', function () {
      spyOn(winston, 'Logger').and.callFake(function () {this.filters = []});
      var Logger = rewire(modulePath);
      var obj = {};
      var logger = new Logger(obj, 'myprefix');

      expect(logger.prefixer).toEqual(jasmine.any(Function));
      expect(logger.prefixer('level', 'msg')).toEqual(jasmine.any(String));
      expect(logger.prefixer.prefix.toLowerCase()).toBe('myprefix');
      expect(winston.Logger).toHaveBeenCalledWith(obj);
    });

    it('sets the prefix if first arg', function () {
      spyOn(winston, 'Logger').and.callFake(function () {this.filters = []});
      var Logger = rewire(modulePath);
      var logger = new Logger('myprefix');
      expect(logger.prefixer).toEqual(jasmine.any(Function));
      expect(logger.prefixer('level', 'msg')).toEqual(jasmine.any(String));
      expect(logger.prefixer.prefix.toLowerCase()).toBe('myprefix');
      expect(winston.Logger).toHaveBeenCalledWith(jasmine.any(Object));
    });
  });

  describe('static #setupTransports', function () {
    var winstonTransports = winston.transports;
    var loggerTransports = Logger.transports;

    afterAll(function () {
      winston.transports = winstonTransports;
      Logger.transports = loggerTransports;
    });

    beforeEach(function () {
      Logger.transports = [];
      Logger.transports.defaults = loggerTransports.defaults;
      winston.transports = jasmine.createSpyObj('transports', ['Console', 'File']);
    })

    it('initializes transports if they exist', function () {
      var o = {v: 1};
      winston.transports.Console.and.returnValue(o);
      winston.transports.File.and.returnValue(o);
      expect(Logger.setupTransports({console: {}}, [])[0]).toEqual(o);
      expect(winston.transports.Console).toHaveBeenCalledWith(Logger.transports.defaults.console);
      expect(Logger.setupTransports({file: true}, [])[0]).toEqual(o);
      expect(winston.transports.File).toHaveBeenCalledWith({});
      expect(() => Logger.setupTransports({notexistant: true}, [])).not.toThrow();
      expect(() => Logger.setupTransports({file: 1}, [])).toThrow();
    });

    it('fills submitted array or global transports array', function () {
      var arr = [];
      expect(Logger.setupTransports({})).toBe(Logger.transports);
      expect(Logger.setupTransports()).toBe(Logger.transports);
      expect(Logger.setupTransports({}, arr)).toBe(arr);
      expect(Logger.setupTransports(null, arr)).toBe(arr);
    });
  });
});
