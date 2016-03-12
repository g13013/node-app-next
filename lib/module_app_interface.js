'use strict';

var strings = require('./helpers/string_transform');
var routesToHtml = require('./helpers/routes_to_html');
var Logger = require('./logger');
var HTTPError = require('node-http-error');
var HTTPStatus = require('http-status');

var map = new WeakMap();

class ModuleAppInterface {
  constructor (moduleName, moduleDescriptor, app) {
    map.set(this, app);

    this.schemas = {};
    this.moduleName = moduleName;
    this.moduleDescriptor = moduleDescriptor;
    this.router = new app.Router();
    this.Joi = app.Router.Joi;
    this.Schema = app.Schema;
    this.logger = new Logger(app.config.logger, `Module::${moduleName}`);
    this.Logger = Logger;
    this.router.get('/', this.generateIndexRouteHandler());

    Object.defineProperty(this, 'api', {value: app.api, writable: false});
    Object.defineProperty(this, 'helpers', {value: app.helpers, writable: false});
    Object.defineProperty(this, 'models', {value: app.models, writable: false});

    app.schemas[moduleName] = this.schemas;
  }

  generateIndexRouteHandler () {
    let router = this.router;
    return function* welcomeRoute (next) {
      let moduleName = strings.capitalize(this.module.app.moduleName);
      this.set('Content-Type', 'text/html');
      this.html = `
        <h3>${moduleName} module</h3>
        ${routesToHtml(router)}
        <br>
        <a href="/">/</a>
      `;
      yield next;
    }
  }

  model (name, schema, collection, skipinit) {
    let app = map.get(this);
    name = strings.classify(name);

    if (schema) {
      if (!(schema instanceof this.Schema)) {
        schema = new this.Schema(schema);
      }
      this.schemas[name] = schema;
    }

    return app.db.model(name, schema, collection, skipinit);
  }

  getSchema (name, module) {
    var app = map.get(this);

    if (!name) {
      throw new Error(`Invalid Argument: expected Schema name to be a String and got "${typeof name}"`);
    }

    name = strings.classify(name);
    if (module) {
      return app.schemas[module] && app.schemas[module][name];
    }

    return this.schemas[name];
  }
}

ModuleAppInterface.prototype.HTTPError = HTTPError;
ModuleAppInterface.prototype.HTTPStatus = HTTPStatus;

module.exports = ModuleAppInterface;