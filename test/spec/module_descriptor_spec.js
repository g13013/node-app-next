var path = require('path');

describe('#ModuleDescriptor', function () {
  var ModuleDescriptor;
  var reset;
  beforeEach(function () {
    ModuleDescriptor = this.require('module_descriptor');
    reset = ModuleDescriptor.__set__('Logger', this.TestLogger);
  });
  afterEach(function () {
    reset();
  })
  describe('#constructor()', function () {
    it('requires a path', function () {
      expect(() => new ModuleDescriptor()).toThrow();
    })
    
    it('initialisation', function () {
      spyOn(path, 'resolve').and.returnValue('realpath');
      var desc = new ModuleDescriptor('path', 'prfix');
      expect(this.TestLogger).toHaveBeenCalled();
      expect(path.resolve).toHaveBeenCalledWith('path');
      expect(desc.path).toBe('realpath');
      expect(desc.prefix).toBe('prfix');
    });
  });

  describe('@packageInfo, @name, @VERSION, @unprefixedName', function () {
    it('must return content of package.json info ', function () {
      var desc = new ModuleDescriptor(`${global.FIXTURE_DIR}/modules_fixtures/node_modules/module`, 'p');
      expect(desc.packageInfo).toEqual(this.require(`${global.FIXTURE_DIR}/modules_fixtures/node_modules/module/package.json`));
      expect(desc.name).toEqual('p-module3');
      expect(desc.VERSION).toEqual('0.1.13');
      expect(desc.unprefixedName).toEqual('module3');
    });

    it('safely return object with name of the folder if package.json does not exist', function () {
      var desc = new ModuleDescriptor('not/p-existant', 'p');
      expect(desc.packageInfo).toEqual({name: 'p-existant', version: ''});
      expect(desc.name).toEqual('p-existant');
      expect(desc.VERSION).toEqual('');
      expect(desc.unprefixedName).toEqual('existant'); // !! :)
    });
  });

  describe('load', function () {
    it('returns module instance', function () {
      var desc = new ModuleDescriptor(`${global.FIXTURE_DIR}/modules_fixtures/node_modules/module`);
      var ins = desc.load();
      expect(ins).toBe(require(desc.path));
      expect(ins).toBe(desc.instance);
    });
    it('returns cached instance', function () {
      var desc = new ModuleDescriptor(`${global.FIXTURE_DIR}/modules_fixtures/node_modules/module`);
      desc.instance = {};
      expect(desc.load()).toBe(desc.instance);
    });

    it('throws if does not exist', function () {
      var desc = new ModuleDescriptor('non-existant');
      expect(() => desc.load()).toThrow();
    });
  });
});
