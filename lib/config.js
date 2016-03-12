'use strict';

var EventEmitter = require('events');
var fs = require('fs');
var path = require('path');
var merge = require('merge');
var yaml = require('js-yaml');
var objectPath = require('object-path');

var YAML_EXT = /\.(yml|yaml)$/
//TODO support json

class Config extends EventEmitter {
  constructor(options) {
    super();

    options = options || {};
    this.paths = options.paths || [];
    this.config = objectPath(options.config || {});

    this.loaded = [];

    if (!Array.isArray(this.paths)) {
      throw new TypeError('paths for config must be an Array');
    }

    var load = this.paths.length > 0 && options.load !== false;
    if (load) {
      this.load();
    }
  }

  loadFromFile (file) {
    var partial = fs.readFileSync(file, 'UTF-8');

    if (YAML_EXT.test(file)) {
      partial = yaml.safeLoad(partial);
    } else {
      partial = JSON.parse(partial);
    }

    merge.recursive(this.config.get(), partial);
    this.loaded.push(path.resolve(file));
  }

  load() {
    this.paths.forEach(
      (file) => (fs.existsSync(file) && this.loadFromFile(file))
    );
  }

  get () {
    return this.config.get.apply(this.config, arguments);
  }

  set () {
    return this.config.set.apply(this.config, arguments);
  }

  del () {
    return this.config.del.apply(this.config, arguments);
  }

  has () {
    return this.config.has.apply(this.config, arguments);
  }

  insert () {
    return this.config.insert.apply(this.config, arguments);
  }

  push () {
    return this.config.push.apply(this.config, arguments);
  }

  ensureExists () {
    return this.config.ensureExists.apply(this.config, arguments);
  }

  empty () {
    return this.config.empty.apply(this.config, arguments);
  }

  coalesce () {
    return this.config.coalesce.apply(this.config, arguments);
  }
}

module.exports = exports = Config;
