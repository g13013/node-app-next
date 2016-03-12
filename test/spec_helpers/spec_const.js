global.FIXTURE_DIR = `${process.cwd()}/test/fixtures`;
global.TEST_HELPERS_DIR = `${process.cwd()}/test/logger`;
global.LIB_DIR = `${process.cwd()}/lib`;

var app_env = 'APP_ENV' in process.env && process.env.APP_ENV;
var node_env = 'NODE_ENV' in process.env && process.env.NODE_ENV;

afterEach(function () {
  //restore env after each all tests
  if (app_env !== false) {
    process.env.APP_ENV = app_env;
  } else {
    delete process.env.APP_ENV;
  }
  
  if (node_env !== false) {
    process.env.NODE_ENV = node_env;
  } else {
    delete process.env.NODE_ENV;
  }
})
