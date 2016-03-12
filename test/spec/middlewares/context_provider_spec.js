'use strict';

var middlewareFor = require(global.LIB_DIR + '/middlewares/context_provider').middlewareFor;
var context;

function* nextFn () {
  yield 1;
}

function withContext (next, ctx, key) {
  var ret;
  var gen;
  var actual;

  context.genFn = middlewareFor(ctx, key);
  gen = context.genFn(next);
  ret = gen.next().value;
  actual = gen.next();
  while (!actual.done) {
    ret = actual.value;
    actual = gen.next();
  }

  return ret;
}

describe('Routes helpers', function () {
  beforeEach(() => context = {});
  describe('#middlewareFor', function () {
    it('object with key', function () {
      var ctx = {prop1: 1, prop2: 2};
      expect(withContext(nextFn, ctx, 'key')).toBe(nextFn);
      expect(context).toBe(context);
      expect(context && context.key).toBe(ctx);
    });

    it('object without key', function () {
      var ctx = {prop1: 1, prop2: 2};

      expect(withContext(nextFn(), ctx)).toBe(1);
      expect(context).toBe(context);
      expect(context && context.prop1).toBe(1);
      expect(context && context.prop2).toBe(2);
    });

    it('function', function () {
      var fn = function () {};
      expect(withContext(nextFn, fn, 'key')).toBe(nextFn);
      expect(context).toBe(context);
      expect(context && context.key).toBe(fn);
    });

    it('function without key', function () {
      expect(() => withContext(nextFn, function () {})).toThrowError(TypeError);
    });

    it('Wrong context', function () {
      expect(() => withContext(nextFn)).toThrowError(TypeError);
    });
  });
});
