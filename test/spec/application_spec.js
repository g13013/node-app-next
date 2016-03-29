'use strict';

var fs = require('fs');
var stringTransform = require(global.LIB_DIR + '/helpers/string_transform');
var ModulesMap = require(global.LIB_DIR + '/modules_map');
var ModuleDescriptor = require(global.LIB_DIR + '/module_descriptor');
var serverIndexRoute = require(global.LIB_DIR + '/middlewares/index_page_generator');
var contextProvider = require(global.LIB_DIR + '/middlewares/context_provider');

describe('Application', function () {
  var Application;

  beforeEach(function () {
    Application = this.require('application');
    this.serverConfig = {
      config: {
        logs: {key: 1},
        server: {port: 400},
        'logs.transports': {key2: 2},
        db: {}
      },
      get: jasmine.createSpy('get').and.callFake(key => this.serverConfig.config[key]),
      set: jasmine.createSpy('set').and.callFake((key, value) => this.serverConfig.config[key] = value)
    };
    spyOn(ModulesMap.prototype, 'loadFrom');
    this.server = this.newRouter();
    this.router = this.newRouter();
    this.logger = jasmine.createSpyObj('logger', ['error', 'debug', 'info', 'warn', 'silly', 'critical']);
    this.modulesMap = new ModulesMap();
    this.db = jasmine.createSpyObj('db', ['connect']);
    this.server.start = jasmine.createSpy();
    this.server.stop = jasmine.createSpy();
    Object.defineProperty(Application.prototype, 'DBAdapter', {value: jasmine.createSpy().and.returnValue(this.db)});
    Object.defineProperty(Application.prototype, 'Config', {value: jasmine.createSpy().and.returnValue(this.serverConfig)});
    Object.defineProperty(Application.prototype, 'Schema', {value: jasmine.createSpy()});
    Object.defineProperty(Application.prototype, 'Server', {value: jasmine.createSpy().and.returnValue(this.server)});
    Object.defineProperty(Application.prototype, 'Router', {value: jasmine.createSpy().and.returnValue(this.router)});
    Object.defineProperty(Application.prototype, 'Logger', {value: jasmine.createSpy().and.returnValue(this.logger)});
    Object.defineProperty(Application.prototype, 'ModuleAppInterface', {value: jasmine.createSpy()});
    Object.defineProperty(Application.prototype, 'ModulesMap', {value: jasmine.createSpy().and.returnValue(this.modulesMap)});
    Application.prototype.Logger.setupTransports = jasmine.createSpy();
  });

  describe('#constructor', function () {
    it('lookupPaths', function () {
      spyOn(fs, 'existsSync').and.returnValues(true, true, false, false);
      var app = new Application();
      expect(app.Config.calls.first().args[0].paths).toEqual([
        `${process.cwd()}/config.yml`,
        `${process.env.HOME}/.app-nextrc.yml`
      ]);
      app.Config.calls.reset();
      app = new Application();
      expect(app.Config.calls.first().args[0].paths).toEqual([
        `${process.cwd()}/config.json`,
        `${process.env.HOME}/.app-nextrc`
      ]);
    });
    it('initializes', function () {
      var cfg = {};
      var app = new Application(cfg);
      expect(Application.prototype.Logger.setupTransports).toHaveBeenCalledWith({key2: 2});

      var pkg = require(process.cwd() + '/package.json');
      expect(app.name).toBe(stringTransform.classify(pkg.name));
      expect(app.descriptor).toEqual(jasmine.any(ModuleDescriptor));
      expect(app.api).toEqual({});
      expect(app.schemas).toEqual({});
      expect(app.modules).toEqual({});
      expect(app.Logger).toHaveBeenCalledWith('Application');
      expect(app.Server).toHaveBeenCalledWith(this.serverConfig.config.server);
      expect(app.logger).toBe(this.logger);
      expect(app.router).toBe(this.router);
      expect(app.server).toBe(this.server);
      expect(app.modulesMap).toBe(this.modulesMap);
      expect(app.db).toBe(this.db);
    });
  });

  it('@db', function () {
    var app = new Application();
    app.db.models = {};
    expect(app.models).toBe(app.db.models);
  });

  describe('#setupModules', function () {
    it('without error', function () {
      var mod1 = {api: {}};
      var mod2 = {api: {}};
      var Mod1 = jasmine.createSpy('Module1Constrcutor').and.returnValue(mod1);
      var Mod2 = jasmine.createSpy('Module2Constrcutor').and.returnValue(mod2);
      var interface1 = {logger: new this.TestLogger(), router: this.newRouter()}
      var interface2 = {logger: new this.TestLogger(), router: this.newRouter()}
      var app = new Application();
      var mod1Config = {};
      var mod2Config = {};

      app.config.set('modules.appModule', mod1Config);
      app.config.set('modules.anotherAppModule', mod2Config);

      spyOn(contextProvider, 'middlewareFor');
      app.modulesMap.descriptors = {
        'mod1': {load: jasmine.createSpy('load').and.returnValue(Mod1), unprefixedName: 'app-module'},
        'mod2': {load: jasmine.createSpy('load').and.returnValue(Mod2), unprefixedName: 'another_app_module'},
        'mod3': {load: jasmine.createSpy('load').and.throwError(), unprefixedName: 'another_app_module'}
      }

      app.ModuleAppInterface.and.returnValues(interface1, interface2);
      interface1.router.middleware.and.returnValue('interface1 middleware');
      interface2.router.middleware.and.returnValue('interface2 middleware');
      contextProvider.middlewareFor.and.returnValues('ctx 1 middleware', 'ctx 2 middleware');
      app.setupModules();

      expect(app.modules.appModule).toBe(mod1);
      expect(app.modules.anotherAppModule).toBe(mod2);
      expect(app.api.appModule).toBe(mod1.api);
      expect(app.api.anotherAppModule).toBe(mod2.api);
      expect(app.ModuleAppInterface).toHaveBeenCalledWith('appModule', app.modulesMap.descriptors.mod1, app);
      expect(app.ModuleAppInterface).toHaveBeenCalledWith('anotherAppModule', app.modulesMap.descriptors.mod2, app);
      expect(Mod1).toHaveBeenCalledWith(interface1, mod1Config);
      expect(Mod2).toHaveBeenCalledWith(interface2, mod2Config);
      expect(app.router.use).toHaveBeenCalledWith('/appModule', 'ctx 1 middleware', 'interface1 middleware');
      expect(app.router.use).toHaveBeenCalledWith('/anotherAppModule', 'ctx 2 middleware', 'interface2 middleware');
      expect(contextProvider.middlewareFor).toHaveBeenCalledWith({logger: interface1.logger, module: mod1});
      expect(contextProvider.middlewareFor).toHaveBeenCalledWith({logger: interface1.logger, module: mod1});
    });
  });

  it('#setupServer()', function () {
    var app = new Application();
    spyOn(contextProvider, 'middlewareFor');
    spyOn(serverIndexRoute, 'getMiddleware');
    spyOn(app, 'setupModules');
    spyOn(app, 'logRoutes');
    serverIndexRoute.getMiddleware.and.returnValue('index generator')
    app.modules.mod1 = {start: jasmine.createSpy('start of mod1')};
    app.modules.mod2 = {start: jasmine.createSpy('start of mod1')};
    app.router.middleware.and.returnValue('router middleware');
    contextProvider.middlewareFor.and.returnValue({context: 'ok'});
    app.setupServer();

    expect(app.setupModules).toHaveBeenCalledWith();
    expect(contextProvider.middlewareFor).toHaveBeenCalledWith(app.context);
    expect(app.modules.mod1.start).toHaveBeenCalled();
    expect(app.modules.mod2.start).toHaveBeenCalled();
    expect(serverIndexRoute.getMiddleware).toHaveBeenCalled();
    expect(app.server.use).toHaveBeenCalledWith({context: 'ok'});
    expect(app.server.use).toHaveBeenCalledWith(require(global.LIB_DIR + '/middlewares/request_logger'));
    expect(app.server.use).toHaveBeenCalledWith(require(global.LIB_DIR + '/middlewares/server_error_handler'));
    expect(app.server.use).toHaveBeenCalledWith(require(global.LIB_DIR + '/middlewares/html_response'));
    expect(app.server.use).toHaveBeenCalledWith('router middleware');
    expect(app.router.get).toHaveBeenCalledWith('/', 'index generator');
    expect(app.logRoutes).toHaveBeenCalled();
  })

  it('#start()', function () {
    var app = new Application();
    spyOn(app, 'handleUncaughtException');
    spyOn(app, 'watchProcess');
    spyOn(app, 'setupServer');
    app.start();
    expect(app.handleUncaughtException).toHaveBeenCalled();
    expect(app.watchProcess).toHaveBeenCalled();
    expect(app.db.connect).toHaveBeenCalled();
    expect(app.server.start).toHaveBeenCalledWith();
  })

  it('#stop()', function (done) {
    var app = new Application();

    app.db.close = jasmine.createSpy('db.close').and.returnValue('db close return');
    app.server.stop.and.returnValue('server stop return');
    var ret = app.stop();
    expect(ret).toEqual(jasmine.any(Promise));
    expect(app.db.close).toHaveBeenCalled();
    expect(app.server.stop).toHaveBeenCalled();
    ret.then((r) => {
      expect(r).toEqual(['db close return', 'server stop return']);
      done()
    }).catch((err) => fail(`${err}`));
  })

  it('#logRoutes()', function () {
    var app = new Application();
    app.router.router = {
      stack: [{methods: ['GET'], path: 'r1'}, {methods: ['GET'], path: 'r1'}]
    }
    app.logRoutes();
    expect(app.logger.info.calls.count()).toBe(2);
  })

  it('#handleUncaughtException()', function () {
    var app = new Application();
    spyOn(process, 'on').and.callFake((event, cb) => {
      expect(() => cb(new Error('ded'))).not.toThrow();
    });
    app.handleUncaughtException();
    expect(process.on).toHaveBeenCalledWith('uncaughtException', jasmine.any(Function));

  })

  describe('#watchProcess()', function () {
    var app;
    var promise;
    beforeEach(function () {
      promise = {then: jasmine.createSpy('then'), catch: jasmine.createSpy('catch')}
      app = new Application();
      spyOn(app, 'exit');
      spyOn(app, 'stop').and.returnValue(promise);
      spyOn(process, 'on');
    });

    it('registers for termination events', function () {
      app.watchProcess();
      expect(process.on).toHaveBeenCalledWith('SIGHUP', jasmine.any(Function));
      expect(process.on).toHaveBeenCalledWith('SIGINT', jasmine.any(Function));
      expect(process.on).toHaveBeenCalledWith('SIGQUIT', jasmine.any(Function));
      expect(process.on).toHaveBeenCalledWith('SIGABRT', jasmine.any(Function));
      expect(process.on).toHaveBeenCalledWith('SIGTERM', jasmine.any(Function));
    });

    it('calls #exit on resolve', function () {
      process.on.and.callFake((evt, cb) => cb()); // emit the vent
      promise.then.and.returnValue(promise).and.callFake((cb) => {
        cb();
        return promise;
      });
      promise.catch.and.returnValue(promise);
      app.watchProcess();
      expect(app.stop).toHaveBeenCalled();
      expect(promise.then).toHaveBeenCalled();
      expect(promise.catch).toHaveBeenCalled();
      expect(app.exit.calls.count()).toBe(5);

    });

    it('calls #exit on reject', function () {
      process.on.and.callFake((evt, cb) => cb()); // emit the vent
      promise.then.and.returnValue(promise);
      promise.catch.and.callFake((cb) => {
        cb();
        return promise;
      });
      app.watchProcess();
      expect(app.stop).toHaveBeenCalled();
      expect(promise.then).toHaveBeenCalled();
      expect(promise.catch).toHaveBeenCalled();
      expect(app.exit.calls.count()).toBe(5);
    });
  });

  it('#exit()', function () {
    var app = new Application();
    spyOn(process, 'exit');
    app.exit();
    expect(process.exit).toHaveBeenCalledWith(0);
    app.exit(12);
    expect(process.exit).toHaveBeenCalledWith(1);
    app.exit({});
    expect(process.exit).toHaveBeenCalledWith(1);
    app.exit(false);
    expect(process.exit).toHaveBeenCalledWith(0);
    app.exit(true);
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
