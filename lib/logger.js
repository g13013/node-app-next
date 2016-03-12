'use strict';

var winston = require('winston');
var merge = require('merge');

class Logger extends winston.Logger {
  constructor (options, prefix) {
    if (typeof options === 'string') {
      prefix = options;
      options = null;
    }

    options = options || {}


    if (!options.transports) {
      if (options.useGlobalTransports !== false) {
        options.transports = Logger.transports;
      }
    } else {
      options.transports = Logger.setupTransports(options.transports, []);
    }

    super(options);

    if (prefix) {
      this.prefix = prefix;
    }
  }

  static createLogPrefixer (prefix) {
    prefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    var prefixer = function (level, msg/*, transport, meta*/) {
      return `[${prefix}] ${msg}`;
    }

    prefixer.prefix = prefix;
    return prefixer;
  }

  static setupTransports (config, transports) {
    transports = transports || Logger.transports;

    if (typeof config !== 'object') {
      return transports;
    }

    for (let key in config) {
      let name = key.charAt(0).toUpperCase() + key.slice(1);
      let Transport = winston.transports[name];
      let cfg = config[key];

      if (cfg === true) {
        cfg = {};
      } else if (typeof cfg !== 'object') {
        throw new TypeError(`Logger transport config must be of type boolean/object, got "${typeof cfg}"`);
      }

      cfg = merge(true, Logger.transports.defaults[key], cfg);

      if (typeof  Transport === 'function') {
        transports.push(new Transport(cfg));
      }
    }

    return transports;
  }

  set prefix (name) {
    if (typeof name === 'string' && !this.prefixer) {
      this.prefixer = Logger.createLogPrefixer(name);
      this.filters.push(this.prefixer);
    }
  }
}

Logger.transports = [];
Logger.transports.defaults = {
  console: {
    stderrLevels: ['error', 'warn', 'debug'],
    colorize: true,
    level: 'debug',
    prettyPrint: true,
    depth: 1
  }
};

module.exports = exports = Logger;
