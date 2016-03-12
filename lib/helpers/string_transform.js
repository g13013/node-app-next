'use strict';

/**
 * Convert a string in to its Class string representation
 *
 * @example
 *     //all these class convert to `SomeClass`
 *     classify('someClass');
 *     classify('some-Class');
 *     classify('some_Class');
 *
 * @param  {String} string string to convert
 * @return {String}        Class representation string
 */
function classify (string) {
  if (typeof string !== 'string') {
    throw `classify: expected a string but got "${typeof string}"`;
  }

  return string.replace(/((^|\.)[a-z]|[_\-]\w)/g, function (match, letter, sep) {
    sep = sep || '';
    letter = (letter.length > 1) ? letter[1].toUpperCase() : letter.toUpperCase();
    return sep + letter;
  });
}

/**
 * Convert a string in to its Class string representation
 *
 * @example
 *     //all these class convert to `someClass`
 *     camelize('someClass');
 *     camelize('some class');
 *     camelize('some-Class');
 *     camelize('some_Class');
 *
 * @param  {String} string string to convert
 * @return {String}        camelize representation string
 */
function camelize (string) {
  if (typeof string !== 'string') {
    throw `camelize: expected a string but got "${typeof string}"`;
  }

  return string.replace(/[_ \-](\w)/g, function (match, letter) {
    return letter[0].toUpperCase();
  });
}

/**
 * Capitalize the first letter of a word
 *
 * @example
 *     capitalize('someWord'); // => SomeWord
 *     capitalize('some-Word'); // => Some-Word
 *     capitalize('some_Word'); // => Some_Word
 *     capitalize('some word'); // => Some word
 *     capitalize('some word'); // => Some Word
 *
 * @method capitalize
 * @param  {String}   string string to capitalize
 * @return {String}          capitalized string
 */
function capitalize(string) {
  if (typeof string !== 'string') {
    throw `capitalize: expected a string but got "${typeof string}"`;
  }

  var s = capitalize.cache[string];

  if (!s) {
    s = string.trim();
    capitalize.cache[string] = s = s.charAt(0).toUpperCase() + s.slice(1);
  }

  return s;
}
capitalize.cache = {};

const props = {
  classified: classify,
  camelized: camelize,
  capitalized: capitalize
};
const stringProto = String.prototype;
const registered = [];

exports.registerPrototype = function () {
  for(let prop in props) {
    if (stringProto.hasOwnProperty(prop)) {
      continue;
    }

    let fn = props[prop];
    Object.defineProperty(stringProto, prop, {
      configurable: true,
      readonly: true,
      get () {
        return fn(this);
      }
    });

    registered.push(prop);
  }
}
exports.unregisterPrototype = function () {
  for (var prop of registered) {
    registered.unshift();
    delete stringProto[prop];
  }
}

exports.capitalize = capitalize;
exports.camelize = camelize;
exports.classify = classify;
