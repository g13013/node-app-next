# AppNext

[![Code Climate](https://codeclimate.com/github/g13013/node-app-next/badges/gpa.svg)](https://codeclimate.com/github/g13013/node-app-next)
[![Coverage Status](https://coveralls.io/repos/github/g13013/node-app-next/badge.svg?branch=master)](https://coveralls.io/github/g13013/node-app-next?branch=master)

A simple modular framework that uses exclusively the latest JavaScript syntax (ES6+).

## Status

**Production Ready:** No

**This is 0.x beta software. Until version 1.x the API is considered UNSTABLE**

## Installation

`npm install app-next`

## Features

*   **Implemented**:

    *   Auto-loading of `JSON` or `YAML` configuration files
    *   DbAdapter, Model and Schema management for `mongodb` using `mongoose`
    *   Logging using `winston`
    *   Web server using `koa`
    *   A routing system using `koa-joi-router`
    *   Components with auto-loading, see [Components](#Components)


*   **Next**:

    *   implement a plugins system
    *   implement a views mangement system
    *   implement a CLI interface `app-next-cli`

## Components

Components are simple modules that are automatically loaded and wired to the application instance, extending it's library and providing their own routes and models.

`app-next-module` provides basic module functionnality, it is not required that modules extend from it, but it's strongly recommended

## Usage

Considering a simple application named `my-app` with the following basic code

`index.js`

```JavaScript
// index.js
var AppNext = require('app-next');

class MyApp extends AppNext {

}

module.exports = exports = MyApp;
```

`start.js`

```JavaScript
require('my-app').start();

```

`config.yml`

```yaml
server:
  port: 4000

logs:
  transports:
    console:
      level: 'debug'

db:
  host: 192.168.99.100
```

```bash
npm install app-next
npm install my-app-users
npm install my-app-articles
node start.js
```

## Contributing

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Commit your changes: `git commit -am 'Add some feature'`
4.  Push to the branch: `git push origin my-new-feature`
5.  Submit a pull request :D

## Credits

Aboubakr Gasmi <mailto:g13013@gmail.com> && (AppNext Contributors)

## License

MIT
