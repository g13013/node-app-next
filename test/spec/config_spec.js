'use strict';
var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var merge = require('merge');
var Config = require(global.LIB_DIR + '/config');
var rewire = require('rewire');

describe('Config', function () {
  describe('#constructor', function () {
    it('it initializes config and binds objectPath', function () {
      var Config = rewire(global.LIB_DIR + '/config');
      var cfg = {};
      var objectPath = jasmine.createSpy('objectPath').and.returnValue(cfg);
      Config.__set__('objectPath', objectPath);
      new Config();
      expect(objectPath).toHaveBeenCalledWith({});
    });

    it('does not load if paths is empty', function () {
      spyOn(Config.prototype, 'load');
      var config = new Config();
      expect(config.load).not.toHaveBeenCalled();
    });

    it('throws when paths is not an array', function () {
      expect(() => new Config({paths: {}})).toThrowError(TypeError);
    });

    it('options is optionnal', function () {
      spyOn(Config.prototype, 'load');
      expect(() => new Config()).not.toThrow();
    });

    it('it exposes locations in .paths', function () {
      spyOn(Config.prototype, 'load');
      var paths = ['somefile'];
      var config = new Config({paths: paths});
      expect(config.paths).toBe(paths);
      expect(config.load).toHaveBeenCalled();
    });

    it('loads config if options.load === false', function () {
      spyOn(Config.prototype, 'load');
      var config = new Config({load: true, paths: ['somefile']});
      expect(config.load).toHaveBeenCalled();
    });

    it('must not load if options.load === false', function () {
      spyOn(Config.prototype, 'load');
      var config = new Config({load: false});
      expect(config.load).not.toHaveBeenCalled();
    });
  });

  describe('#load', function () {
    it('iterates overs files and calls loadFromFile if exists', function () {
      spyOn(fs, 'existsSync').and.returnValues(true, false, true);
      var config = new Config({paths: ['file1', 'file2', 'file3'], load: false});
      spyOn(config, 'loadFromFile');
      config.load();
      expect(config.loadFromFile).toHaveBeenCalledWith('file1');
      expect(config.loadFromFile).toHaveBeenCalledWith('file3');
    });
  });

  describe('#loadFromFile', function () {
    it('read as json if file is not yaml', function () {
      var parsed = {key: 1};
      spyOn(JSON, 'parse').and.returnValue(parsed);
      spyOn(merge, 'recursive').and.callThrough();
      spyOn(fs, 'readFileSync').and.returnValues('{key: 1}');
      spyOn(path, 'resolve').and.returnValue('fullPath');
      // spyOn(fs, 'readFileSync').and.returnValues('prop1: ', '', '');
      var config = new Config({load: false});
      config.loadFromFile('file');
      expect(JSON.parse).toHaveBeenCalledWith('{key: 1}');
      expect(merge.recursive).toHaveBeenCalledWith(config.get(), parsed);
      expect(config.get()).toEqual(parsed, 'config should be merged');
      expect(config.loaded).toEqual(['fullPath']);
    });

    it('read as yaml if file has ext yaml|yml', function () {
      var parsed1 = {key: 1};
      var parsed2 = {key: 2};
      spyOn(yaml, 'safeLoad').and.returnValues(parsed1, parsed2);
      spyOn(merge, 'recursive').and.callThrough();
      spyOn(fs, 'readFileSync').and.returnValues('key: 1', 'key: 2');
      spyOn(path, 'resolve').and.returnValues('fullPath1', 'fullpath2');
      var config = new Config({load: false});
      config.loadFromFile('file.yml');
      config.loadFromFile('file.yaml');
      expect(yaml.safeLoad).toHaveBeenCalledWith('key: 1');
      expect(yaml.safeLoad).toHaveBeenCalledWith('key: 2');
      expect(merge.recursive).toHaveBeenCalledWith(config.get(), parsed1);
      expect(merge.recursive).toHaveBeenCalledWith(config.get(), parsed2);
      expect(config.get()).toEqual(parsed2, 'config should be merged');
      expect(config.loaded).toEqual(['fullPath1', 'fullpath2']);
    });
  });

  describe('accessors', function () {
    var config = new Config();
    for (let key in config.config) {
      if (typeof config.config[key] === 'function') {
        it(`#${key} accessor`, function () {
          spyOn(config.config, key).and.returnValue('whatever');

          try {
            let val = config[key]('some_key', 2, 3, 4);
            expect(val).toBe('whatever');
            expect(config.config[key].calls.mostRecent().object).toEqual(config.config);
            expect(config.config[key]).toHaveBeenCalledWith('some_key', 2, 3, 4);
          } catch (err) {
            fail(`calling accessor ${key} failed, ${err}`);
          }

        });
      }
    }
  });
});
