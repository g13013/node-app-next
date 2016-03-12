'use strict';

var styles = `
  <style>
    body {font: 16px monospace; background-color: #282828; color: #fff}
    ul {list-style-type: none}
    a {text-decoration: none}
    .color-gray {color: rgba(248, 248, 242, 0.8)}
    .color-green, a {color: #a6e22e}
    .color-yellow {color: #e6db74}
    .color-red {color: #f92672;}
  </style>
`

function* htmlResponseMiddleware(next) {
  let html = null;

  Object.defineProperty(this, 'html', {
    set (body) {
      html = body;
    },
    get () {
      return html;
    }
  });

  yield next;

  if (!this.body && this.html) {
    this.set('Content-Type', 'text/html');
    this.body = `<doctype html><html><head>${styles}</head><body>${html}</body></html>`;
  }
}

module.exports = htmlResponseMiddleware;
