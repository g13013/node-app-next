'use strict';

var path = require('path');
var Logger = require('./logger');

//TODO cache properties;

class ModuleDescriptor {
  constructor (modulePath, prefix) {
    if (!modulePath) {
      throw new Error("ModuleDescriptor module requires a path");
    }

    this.logger = new Logger('ModuleDescriptor');
    this.path = path.resolve(modulePath);
    this.prefix = prefix;
  }

  get packageInfo () {
    try {
      return require(`${this.path}/package.json`);
    } catch (err) {
      this.logger.warn(`Could not read package.json file from "${this.path}"`);
      this.logger.debug(err);
    }

    return {
      name: path.basename(this.path),
      version: ''
    };
  }

  get unprefixedName() {
    return this.name.replace(`${this.prefix}-`, '');
  }

  get name () {
    return this.packageInfo.name;
  }

  get VERSION () {
    return this.packageInfo.version;
  }

  load () {
    if (this.instance) {
      return this.instance;
    }

    return this.instance = require(this.path);
  }
}

module.exports = ModuleDescriptor;
