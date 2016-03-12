
//TODO env from CLI

const APP_ENV = {
  getEnv: () => (process.env.APP_ENV || process.env.NODE_ENV || '').toLowerCase(),
  toString: () => APP_ENV.getEnv()
};

function envGetter (values) {
  return () => values.indexOf(APP_ENV.getEnv()) !== -1;
}

Object.defineProperty(APP_ENV, 'production', {get: envGetter(['', 'prod', 'production'])});
Object.defineProperty(APP_ENV, 'prod', {get: () => APP_ENV.production});
Object.defineProperty(APP_ENV, 'development', {get: envGetter(['dev', 'development'])});
Object.defineProperty(APP_ENV, 'dev', {get: () => APP_ENV.development});
Object.defineProperty(APP_ENV, 'test', {get: envGetter(['test'])});

module.exports = APP_ENV;
