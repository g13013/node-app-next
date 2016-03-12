'use strict';

var routesToHtml = require('../helpers/routes_to_html');

exports.getMiddleware = function (app) {
  var router = app.router;
  var modules = app.modules

  return function* ServerIndexGenerator (next) {
    let modulesNames = Object.keys(modules);
    let routes = routesToHtml(router);
    let modulesRe = new RegExp(`(?:gray"\>\/)(${modulesNames.join('|')})`,'g');

    this.html = `<h3>Welcome to ${app.name}</h3>`;
    if (modulesNames.length !== 0) {
      this.html += '<h4>Modules:</h4>';
      modulesNames.forEach((module) => {
        this.html += `<a href="/${module}">${module.capitalized}</a>`
        this.html += '<br>';
        routes = routes.replace(modulesRe, 'gray"><a href="/$1">/$1</a>');
      });
    }
    this.html += routes;

    yield next;
  }
}
