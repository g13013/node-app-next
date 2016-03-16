'use strict';

var ModuleAppInterface = require(global.LIB_DIR + '/module_app_interface');
var TestLogger = require('../spec_helpers/test_logger');
var co = require('co');


describe('ModuleAppInterface', function () {
  var app;
  var router;
  var desc = {};

  beforeEach(function () {
    router = {router: {stack: []}, get: function () {}};
    app = {};
    app.db = {model: jasmine.createSpy('db.model')};
    app.config = {};
    app.logger = new TestLogger();
    app.Logger = TestLogger;
    app.schemas = {};
    app.api = {};
    app.Router = jasmine.createSpy('appRouter').and.returnValue(router);
    app.Schema = jasmine.createSpy('app.Schema');
  });

  describe('#generateIndexRouteHandler', function () {
    it ('it returns a generator function', function() {
      var inter = new ModuleAppInterface('my_module', desc, app);
      expect(inter.generateIndexRouteHandler().constructor.name).toBe('GeneratorFunction');
    });

    it ('the returned generator returns a string in ', function(done) {
      var inter = new ModuleAppInterface('my_module', desc, app);
      var context = {module: {app: inter}, set: jasmine.createSpy(), gen: inter.generateIndexRouteHandler()};
      co(context.gen({})).then(() => {
        expect(context.html).toEqual(jasmine.any(String));
        done();
      }, (err) => {
        fail(`returned an error ${err}`);
        done()
      });
    });
  });

  describe('#constructor', function () {
    it('it sets the first welcome route and module name', function () {
      spyOn(ModuleAppInterface.prototype, 'generateIndexRouteHandler');
      let obj = new ModuleAppInterface('my_module', desc, app);
      expect(obj.generateIndexRouteHandler).toHaveBeenCalledWith();
      expect(obj.moduleName).toBe('my_module');
      expect(obj.moduleDescriptor).toBe(desc);
    });

    it('should initialize new router', function () {
      let obj = new ModuleAppInterface('my_module', desc, app);
      expect(obj.router).toEqual(router);
    });

    it('provides app Schema', function () {
      let obj = new ModuleAppInterface('my_module', desc, app);
      expect(obj.Schema).toBe(app.Schema);
    });
  });

  describe('#model', function () {
    it('proxies to db.model', function () {
      var schema = new app.Schema();
      var inter = new ModuleAppInterface('my_module', desc, app);
      inter.model('model_name', schema, 3, 4);
      expect(app.db.model).toHaveBeenCalledWith('MyModuleModelName', schema, 3, 4);
      inter.model('model_name_2', false, 3, 4);
      expect(app.db.model).toHaveBeenCalledWith('MyModuleModelName2', false, 3, 4);
    });

    it('creates new instance of Schema if schema is object', function () {
      var schema = {prop: String};
      new ModuleAppInterface('my_module', desc, app).model('name', schema);
      expect(app.Schema).toHaveBeenCalledWith(schema);
    });

    it('saves schema to app.schemas and this.schemas', function () {
      // TODO test assertions count
      let schema = {prop: String};
      app.Schema.and.callFake(function () {
        this.prop = 'instance';
      });

      let obj = new ModuleAppInterface('module', desc, app);
      obj.model('model_name', schema);
      expect(obj.schemas.ModelName).toEqual(jasmine.objectContaining({prop: 'instance'}));
      expect(app.schemas.module).toEqual(jasmine.objectContaining({ModelName: obj.schemas.ModelName}));
    });
  });

  describe('#getSchema', function () {
    it('retrieve module schemas', function () {
      let obj = new ModuleAppInterface('module', desc, app);

      obj.schemas.Owned = 1;
      app.schemas.module = {Other: 2};

      expect(obj.getSchema).toThrowError(/^Invalid Argument/);
      expect(obj.getSchema('other', 'module')).toBe(2);
      expect(obj.getSchema('owned')).toBe(1);
      expect(obj.getSchema('unknown')).toBeUndefined();
    });
  });

});
