'use strict';

const lodash = require('lodash');

lodash.mixin({ 'pascalCase': lodash.flow(lodash.camelCase, lodash.upperFirst) });
lodash.mixin({ 'classify': lodash.pascalCase });

module.exports = exports = lodash;
