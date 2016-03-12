'use strict';

const PARAM_RE = /\:([^\/]+)/g;

function routesToHtml(router) {
  var html;
  var stack = router.router.stack;
  
  if (stack.length === 0) {
    return '';
  }

  html = '<h4>Registered routes:</h4><ul>';
  stack.forEach((route) => {
    if (route.methods.length === 0) {
      return;
    }

    var makeLink = route.methods.indexOf('GET') !== -1 && !PARAM_RE.test(route.path);
    var path = route.path.replace(PARAM_RE, (m, param) => `<span class="color-yellow">{${param}}</span>`);

    if (makeLink) {
      path = `<a href="${path}">${path}</a>`;
    }

    html += '<li>';
    html += `<span class="color-red"> => </span> <span class="color-gray">${path}</span>`;
    html += ` (<span class="color-gray">${route.methods.join(', ')}</span>)<br>`;
    html += `</li>`
  });
  html += '</ul>';
  
  return html;
}

module.exports = exports = routesToHtml;
exports.PARAM_RE = PARAM_RE;
