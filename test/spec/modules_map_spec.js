'use strict';

describe('ModulesMap', function () {
  var ModulesMap;
  var reset;
  beforeEach(function () {
    ModulesMap = this.require('modules_map');
    //reset = ModulesMap.__set__('Logger', this.TestLogger);
  });
  
  afterEach(function () {
    reset && reset();
  });

  describe('#constructor()', function () {
    beforeEach(function () {
      spyOn(ModulesMap.prototype, 'loadFrom');
    });
    
    it('props', function () {
      var map = new ModulesMap('path', 'whatever');
      expect(map.descriptors).toEqual({});
      expect(map.loaded).toEqual(jasmine.any(Array));
    });
    it('prefix', function () {
      expect((new ModulesMap('path', 'whatever')).prefix).toBe('whatever');
      ModulesMap.__with__({'ModuleDescriptor': function (){ return {name: 'somename'}}})(() => {
        expect(new ModulesMap('path').prefix).toBe('somename');
      })
      
    });
    it('paths', function () {
      var map = new ModulesMap('path', 'whatever');
      expect(map.loadFrom).toHaveBeenCalledWith('path');
      map.loadFrom.calls.reset();
      map = new ModulesMap();
      expect(map.loadFrom).toHaveBeenCalledWith(process.cwd());
      map.loadFrom.calls.reset();
      map = new ModulesMap(['path1', 'path2']);
      expect(map.loadFrom).toHaveBeenCalledWith('path1');
      expect(map.loadFrom).toHaveBeenCalledWith('path2');
    });
  });

  describe('#loadFrom()', function () {
    // Note: we treat module name that is found in package.json and fall back to directory
    //       name
    it('with prefix', function () {
      let map = new ModulesMap(global.FIXTURE_DIR + '/modules_fixtures', 'pre');
      expect(map.count).toBe(1);
      expect(map.keys).toEqual(['module1']);
    });

    it('without prefix', function () {
      spyOn(process, 'cwd').and.returnValue('dir/p');
      let map = new ModulesMap(global.FIXTURE_DIR + '/modules_fixtures');
      expect(map.count).toBe(1);
      expect(map.keys).toEqual(['module3']);
    });

    it('specific folder', function () {
      spyOn(ModulesMap.prototype, 'loadFrom');
      spyOn(process, 'cwd').and.returnValue('dir/p');
      let map = new ModulesMap();
      map.loadFrom.and.callThrough();
      map.loadFrom(global.FIXTURE_DIR + '/modules_fixtures/node_modules');
      expect(map.count).toBe(3);
      expect(map.keys).toEqual(['p-module3', 'pre-module1', 'module']);
    });
  });

  describe('#loadModule()', function () {
    it('should load module and emit event', function () {
      spyOn(ModulesMap.prototype, 'loadFrom');
      var map = new ModulesMap();
      var cb = jasmine.createSpy('moduleLoaded');
      map.descriptors = {
        'module-1': {load: function () {return this.instance = {key: 1}}}
      }
      map.on('moduleLoaded', cb);
      expect(map.loadModule('module-1')).toEqual({key: 1});
      map.loadModule('module-1');
      expect(cb).toHaveBeenCalledWith('module-1', {key: 1});
      expect(() => map.loadModule('noexistant')).toThrow();
    });
  });

  it('@keys & @count from descriptors object', function () {
    spyOn(ModulesMap.prototype, 'loadFrom');
    let map = new ModulesMap();
    map.descriptors = {
      k: 1,
      b: 2
    }
    expect(map.keys).toEqual(['k', 'b']);
    expect(map.count).toEqual(2);
  });

  it('#getDescriptor', function () {
    spyOn(ModulesMap.prototype, 'loadFrom');
    let map = new ModulesMap();
    map.descriptors = {'some-module': {}};
    expect(map.getDescriptor('some-module')).toBe(map.descriptors['some-module']);
  });

  it('__iterable__', function () {
    spyOn(ModulesMap.prototype, 'loadFrom');
    var map = new ModulesMap();
    var mod1 = {};
    var mod2 = {};
    var mods = [mod2, mod1];
    var desc = {load: jasmine.createSpy().and.returnValues(mod1, mod2)};
    map.descriptors['name1'] = map.descriptors['name2'] = desc;
    for (let module of map) {
      expect(module).toBe(mods.pop());
    }
  });
});
