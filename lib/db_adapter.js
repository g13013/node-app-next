'use strict';

var mongoose = require('mongoose');
var Logger = require('./logger');
var url = require('url');
var MongooseConnection = mongoose.Connection;

/*eslint-disable*/

class DBAdapter extends MongooseConnection {
  constructor (config) {
    super(mongoose);
    this.logger = new Logger(null, 'Database');
    this.config = config || {};
    this.connectionString = this.config.connectionString;
    this.on('connected', () => this.logger.info('connected to db'));
    this.on('disconnected', () => this.logger.info('disconnected from db'));
    this.on('close', () => this.logger.warn('connection closed'));
    this.on('error', err => this.logger.error('connection', err));
  }

  connect () {
    if (this.readyState === DBAdapter.STATE_CONNECTED) {
      return Promise.resolve();
    } else if (this.readyState === DBAdapter.STATE_CONNECTING) {
      return this._connectPromise;
    }

    this.logger.info('connecting to database');
    return this._connectPromise = this.open(this.connectionString).then(() => {
      delete this._connectPromise;
    }).catch((err) => {
      delete this._connectPromise;
      throw err;
    });
  }

  get connectionString () {
    let username = this.config.username || '';
    let password = this.config.username && this.config.password || '';
    return url.format({
      auth: `${username}:${password}`.replace(/^:|:$/g, ''),
      port: this.config.port,
      hostname: this.config.host,
      protocol: this.config.protocol || 'mongodb',
      slashes: true
    });
  }

  set connectionString (conStr) {
    if (conStr) {
      try {
        var uri = url.parse(conStr);
      } catch(err) {
        err.message = `DBAdapter: ${err.message}`;
        throw err;
      }
    }

    let auth = uri && uri.auth && uri.auth.split(':');
    this.config.host = uri && uri.hostname || this.config.host || '127.0.0.1';
    this.config.port = uri && parseInt(uri.port) || this.config.port || 27017;
    this.config.username = auth && auth[0] || this.config.username;
    this.config.password = auth && auth[1] || this.config.password;
    this.config.protocol = uri && uri.protocol && uri.protocol.replace(/:$/, '') || this.config.protocol;
  }
}

DBAdapter.STATE_DISCONNECTED = 0
DBAdapter.STATE_CONNECTED = 1
DBAdapter.STATE_CONNECTING = 2
DBAdapter.STATE_DISCONNECTING = 3

module.exports = DBAdapter;
