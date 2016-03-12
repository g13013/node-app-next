'use strict';

var DBAdapter = require(global.LIB_DIR + '/db_adapter');

describe('DBAdapter', function () {
  describe('#constructor', function () {
    it('exports config', function () {
      let cfg = {prop: ''};
      let db = new DBAdapter(cfg);
      expect(db.config).toBe(cfg);
    });
  });

  describe('mongoose events', function () {
    it('connected', function (done) {
      var db = new DBAdapter();
      db.on('connected', done);
      db.emit('connected');
    })
    it('cose', function (done) {
      var db = new DBAdapter();
      db.on('close', done);
      db.emit('close');
    })
    it('error', function (done) {
      var db = new DBAdapter();
      db.on('error', done);
      db.emit('error');
    })
    it('disconnected', function (done) {
      var db = new DBAdapter();
      db.on('disconnected', done);
      db.emit('disconnected');
    })
  });

  describe('#connect', function () {
    it('resolves directly when connected', function () {
      spyOn(Promise, 'resolve').and.callThrough();
      var db = new DBAdapter();
      db.readyState = DBAdapter.STATE_CONNECTED;
      expect(db.connect()).toEqual(jasmine.any(Promise));
      expect(Promise.resolve).toHaveBeenCalled();
    });

    it('return existant promise', function () {
      var db = new DBAdapter();
      db._connectPromise = 1;
      db.readyState = DBAdapter.STATE_CONNECTING;
      expect(db.connect()).toEqual(1);
    });


    it('rejects on fail and remove old promise', function (done) {
      var db = new DBAdapter();
      spyOn(db, 'open').and.callFake(() => Promise.reject());
      var promise = db.connect();
      global.expectPromise(promise);
      promise.then(() => {
        fail('promise should reject when error');
        done();
      }).catch(() => {
        expect(db._connectPromise).toBe(undefined);
        done();
      });
    });

    it('resolves on success and remove old promise', function (done) {
      var db = new DBAdapter();
      spyOn(db, 'open').and.callFake(() => Promise.resolve());
      var promise = db.connect();
      global.expectPromise(promise);
      promise.then(() => {
        expect(db._connectPromise).toBe(undefined);
        done();
      }).catch((err) => {
        fail(`promise should resolve when not error: ${err}`);
        done();
      });
    });
  });

  describe('#connectionString', function () {
    it('throws on invalid uri', function () {
      let db = new DBAdapter({});
      expect(() => db.connectionString = {}).toThrowError(TypeError);
    });

    it('should return default', function () {
      let db = new DBAdapter({});
      expect(db.connectionString).toBe('mongodb://127.0.0.1:27017', 'default connection string');
    });

    it('should parse from url', function () {
      let db = new DBAdapter({connectionString: 'http://user:pass@somehost.com:27080'});
      expect(db.connectionString).toBe('http://user:pass@somehost.com:27080');
      expect(db.config.port).toBe(27080);
      expect(db.config.host).toBe('somehost.com');
      expect(db.config.username).toBe('user');
      expect(db.config.password).toBe('pass');
      expect(db.config.protocol).toBe('http');
    });

    it('shoul format from config', function () {
      let db = new DBAdapter({username: 'aboubakr', connectionString: '//somehost.com'});
      expect(db.connectionString).toBe('mongodb://aboubakr@127.0.0.1:27017');
    });

    it('shoul format set auth correctly', function () {
      let db = new DBAdapter({password: 'pass'});
      expect(db.connectionString).toBe('mongodb://127.0.0.1:27017');
      db.config.username = 'aboubakr';
      expect(db.connectionString).toBe('mongodb://aboubakr:pass@127.0.0.1:27017');
    });
  });
});
