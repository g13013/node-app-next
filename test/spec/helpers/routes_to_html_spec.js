'use strict';

var routesToHtml = require(global.LIB_DIR + '/helpers/routes_to_html');

describe('#routesToHtml', function ( ) {
  it('empty stack', function () {
    var router = {router: {stack: []}};
    expect(routesToHtml(router)).toBe('');
  });

  it('stack with methods', function () {
    var router = {
      router: {
        stack: [
          {path: 'route1', methods: ['GET', 'PUT']},
          {path: 'route1', methods: ['POST', 'DEL']}
        ]
      }
    };
    var html = routesToHtml(router)
    expect(html).not.toBe('');
    expect(html).toEqual(jasmine.any(String));
  });

  it('stack without methods', function () {
    var router = {
      router: {
        stack: [
          {path: 'route1', methods: []},
          {path: 'route1', methods: []}
        ]
      }
    };
    var html = routesToHtml(router)
    expect(html).not.toBe('');
    expect(html).toEqual(jasmine.any(String));
  });

  it('dynamic segments', function () {
    var router = {
      router: {
        stack: [
          {path: 'route1/:param/', methods: ['GET']}
        ]
      }
    };
    var html = routesToHtml(router)
    expect(html).not.toBe('');
    expect(html).toEqual(jasmine.any(String));
  });

});
