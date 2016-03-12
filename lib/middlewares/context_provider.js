'use strict';

/**
 * Returns a generator function that provides the given context to use for a router
 *
 * @method addRouteContextMiddleware
 * @param  {Object/Function}          ctx  Function or Object Context
 * @param  {String}                   key  key in context
 * @return {GeneratorFunction}        middleware
 */
function middlewareFor(ctx, key) {
  return function* contextSetupMiddleware(next) {
    if (typeof ctx === 'function') {
      if (!key) {
        throw new TypeError('Cannot set function context for route witout key name');
      }
      this[key] = ctx;
    } else if (typeof ctx === 'object') {
      if (key) {
        this[key] = ctx;
      } else {
        for(let key in ctx) {
          this[key] = ctx[key];
        }
      }
    } else {
      throw new TypeError('Wrong context passed');
    }

    if (next && typeof next.next === 'function') {
      yield * next;
    } else {
      yield next;
    }
  };
}

exports.middlewareFor = middlewareFor;
