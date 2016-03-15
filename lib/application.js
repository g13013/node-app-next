'use strict';

var EventEmitter = require('events');
var fs = require('fs');
var Server = require('./server');
var stringTransform = require('./helpers/string_transform');

var Config = require('./config');
var ModulesMap = require('./modules_map');
var ModuleAppInterface = require('./module_app_interface');
var ModuleDescriptor = require('./module_descriptor');
var DBAdapter = require('./db_adapter');
var Logger = require('./logger');
var Router = require('./router');
var Schema = require('./schema');

var HTTPStatus = require('http-status');
var HTTPError = require('node-http-error');

var htmlResponseMiddleware = require('./middlewares/html_response');
var serverErrorMiddleware = require('./middlewares/server_error_handler');
var requestLoggerMiddleware = require('./middlewares/request_logger');
var indexPageMiddleware = require('./middlewares/index_page_generator');
var contextProviderMiddleware = require('./middlewares/context_provider');

var readOnlyProp = require('./helpers/object').readOnlyProp;
var utils = require('./helpers/utils');

class Application extends EventEmitter {
  constructor (config) {
    super();
    var homeDir = process.env.HOME;
    var dir = process.cwd();
    var descriptor = new this.ModuleDescriptor(process.cwd());
    var name = descriptor.name;
    var configLookupPaths = [
      (fs.existsSync(`${dir}/config.yml`)) ? `${dir}/config.yml` : `${dir}/config.json`,
      (fs.existsSync(`${homeDir}/.${name}rc.yml`)) ? `${homeDir}/.${name}rc.yml` : `${homeDir}/.${name}rc`
    ]
    config = new this.Config({config: config, paths: configLookupPaths});

    var readOnly = this.helpers.readOnlyProp.bind(null, this);
    var context = {};

    this.Logger.setupTransports(config.get('logs.transports'));

    readOnly('name', stringTransform.classify(descriptor.name));
    readOnly('descriptor', descriptor);
    readOnly('context', context);
    readOnly('schemas', {});
    readOnly('modules', {});
    readOnly('api', {});
    readOnly('config', config);
    readOnly('logger', new this.Logger('Application'));
    readOnly('modulesMap', new this.ModulesMap());
    readOnly('db', new this.DBAdapter(config.get('db')));
    readOnly('server', new this.Server(config.get('server')));
    readOnly('router', new this.Router());

    //context.routesContext.pipe =  this.pipeRequest;
    context.HTTPStatus = HTTPStatus;
    context.HTTPError =  HTTPError;
    context.logger =  this.logger;
  }

  get models () {
    return this.db.models;
  }

  setupModules () {
    for (let module of this.modulesMap.keys) {
      try {
        let descriptor = this.modulesMap.getDescriptor(module);
        let moduleName = stringTransform.camelize(descriptor.unprefixedName);
        let Module = this.modulesMap.loadModule(module);
        let appInterface = new this.ModuleAppInterface(moduleName, descriptor, this);
        let instance = new Module(appInterface);
        let context = {module: instance, logger: appInterface.logger};
        let modMiddleware = contextProviderMiddleware.middlewareFor(context);

        this.router.use(`/${moduleName}`, modMiddleware, appInterface.router.middleware());
        this.api[moduleName] = instance.api;
        this.logger.info(`Module loaded - ${moduleName}`);
        this.modules[moduleName] = instance;
      } catch (err) {
        this.logger.warn(`Could not load module ${module}: ${err}`);
        this.logger.debug(err.stack);
      }
    }
    return this;
  }

  logRoutes() {
    this.router.router.stack.forEach((route) => {
      this.logger.info(`registered route (${route.methods}) => ${route.path}`);
      this.logger.silly('route config:', route);
    });
  }

  setupServer () {
    this.setupModules();
    for (let module in this.modules) {
      this.modules[module].start();
    }

    this.router.get('/', indexPageMiddleware.getMiddleware(this));

    this.server.use(contextProviderMiddleware.middlewareFor(this.context));
    this.server.use(requestLoggerMiddleware);
    this.server.use(serverErrorMiddleware);
    this.server.use(htmlResponseMiddleware);
    this.server.use(this.router.middleware());

    this.logRoutes();
  }

  start () {
    this.setupServer();
    this.db.connect();
    this.server.start();
    this.handleUncaughtException();
    this.watchProcess();
  }

  stop () {
    return Promise.resolve([this.db.close(), this.server.stop()]);
  }

  watchProcess () {
    var events = ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGABRT', 'SIGTERM']

    for (let event of events) {
      process.on(event, () => {
        this.logger.info(`${event} recieved!`, this.stop());
        this.stop()
                .then(() => {
                  this.logger.info('closed');
                  this.exit();
                })
                .catch((err) => {
                  this.logger.error(err);
                  this.exit();
                });
      })
    }
  }

  exit (err) {
    this.logger.info('exiting');
    process.exit(err && 1 || 0);
  }

  handleUncaughtException () {
    process.on('uncaughtException', (err) => {
      this.logger.error('UncaughtException: ', err.message);
      this.logger.debug(err.stack);
    });
  }
}

readOnlyProp(Application.prototype, 'utils', utils);
readOnlyProp(Application.prototype, 'DBAdapter', DBAdapter);
readOnlyProp(Application.prototype, 'Config', Config);
readOnlyProp(Application.prototype, 'Server', Server);
readOnlyProp(Application.prototype, 'Schema', Schema);
readOnlyProp(Application.prototype, 'Router', Router);
readOnlyProp(Application.prototype, 'Logger', Logger);
readOnlyProp(Application.prototype, 'Joi', Router.Joi);
readOnlyProp(Application.prototype, 'ModuleAppInterface', ModuleAppInterface);
readOnlyProp(Application.prototype, 'ModuleDescriptor', ModuleDescriptor);
readOnlyProp(Application.prototype, 'ModulesMap', ModulesMap);
readOnlyProp(Application.prototype, 'helpers', {
  readOnlyProp: readOnlyProp
})

stringTransform.registerPrototype();

module.exports = Application;
