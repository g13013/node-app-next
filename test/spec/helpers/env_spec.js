
var env = require(`${global.LIB_DIR}/helpers/env`);

describe('env', function () {

  beforeEach(function () {
    delete process.env.APP_ENV;
    delete process.env.NODE_ENV;
  });
  
  afterAll(function () {
    
  })

  it('#toString()', function() {
    process.env.NODE_ENV = 'dev';
    process.env.APP_ENV = 'production'; // takes precedence
    expect(`${env}`).toBe('production');
    process.env.NODE_ENV = 'test';
    delete process.env.APP_ENV;
    expect(`${env}`).toBe('test')
  });

  it('@production', function () {
    process.env.NODE_ENV = 'production';
    expect(env.production).toBe(true);
    expect(env.prod).toBe(true);
    process.env.NODE_ENV = 'whatever';
    expect(env.production).toBe(false)
    expect(env.prod).toBe(false)
    process.env.APP_ENV = 'production'; // takes precedence
    process.env.NODE_ENV = 'whatever';
    expect(env.production).toBe(true);
    expect(env.prod).toBe(true);
    process.env.APP_ENV = null; // takes precedence
    process.env.NODE_ENV = 'whatever';
    expect(env.production).toBe(false);
    expect(env.prod).toBe(false);
  });

  it('@development', function () {
    process.env.NODE_ENV = 'development';
    expect(env.development).toBe(true);
    expect(env.dev).toBe(true);
    process.env.NODE_ENV = 'whatever';
    expect(env.development).toBe(false)
    expect(env.dev).toBe(false)
    process.env.APP_ENV = 'development'; // takes precedence
    process.env.NODE_ENV = 'whatever';
    expect(env.development).toBe(true);
    expect(env.dev).toBe(true);
    process.env.APP_ENV = null; // takes precedence
    process.env.NODE_ENV = 'whatever';
    expect(env.development).toBe(false);
    expect(env.dev).toBe(false);
  });

  it('@test', function () {
    process.env.NODE_ENV = 'test';
    expect(env.test).toBe(true);
    process.env.NODE_ENV = 'whatever';
    expect(env.test).toBe(false)
    process.env.APP_ENV = 'test'; // takes precedence
    process.env.NODE_ENV = 'whatever';
    expect(env.test).toBe(true);
    process.env.APP_ENV = null; // takes precedence
    process.env.NODE_ENV = 'whatever';
    expect(env.test).toBe(false);
  });
})
