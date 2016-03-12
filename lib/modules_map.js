'use strict';

var fs = require('fs');
var FsNode = require('fs-node');
var ModuleDescriptor = require('./module_descriptor');
var EventEmitter = require('events');

class ModulesMap extends EventEmitter {
  constructor (folders, prefix) {
    super();

    this.descriptors = {};
    this.prefix = prefix || new ModuleDescriptor(process.cwd()).name;
    this.loaded = [];
    folders = [].concat(folders || process.cwd());

    for (let folder of folders) {
      this.loadFrom(folder);
    }
  }

  get count () {
    return Object.keys(this.descriptors).length;
  }

  get keys () {
    return Object.keys(this.descriptors);
  }

  loadModule (name) {
    var alreadyLoaded;
    var instance;
    var desc = this.descriptors[name];

    if (!desc) {
      throw new Error(`Unkown module ${name}`);
    }

    alreadyLoaded = desc.instance;
    instance = alreadyLoaded || desc.load();

    if (!alreadyLoaded) {
      this.emit('moduleLoaded', name, instance);
    }

    return instance;
  }

  loadFrom (folder) {
    var modulesDir = fs.existsSync(`${folder}/node_modules`) ? `${folder}/node_modules` : folder;
    var usePrefix = this.prefix && folder !== modulesDir;
    for (let node of new FsNode(modulesDir)) {
      if (!node.isDirectory || /^\./.test(node.basename)) {
        continue;
      }

      let desc = new ModuleDescriptor(node.path, usePrefix && this.prefix);
      let name = usePrefix ? desc.unprefixedName : desc.name;
      if (!usePrefix || desc.name !== desc.unprefixedName) {
        Object.defineProperty(this.descriptors, name, {
          enumerable: true,
          writable: false,
          value: desc
        })
      }
    }

    this.loaded.push(folder);
  }

  getDescriptor (module) {
    return this.descriptors[module];
  }

  * [Symbol.iterator] () {

    for (let moduleName of this.keys) {
      yield this.loadModule(moduleName);
    }
  }
}

module.exports = ModulesMap;
