'use strict';

function readOnlyProp(object, prop, value) {
  Object.defineProperty(object, prop, {
    configurable: true,
    enumerable: true,
    writable: false,
    value: value
  });
}

exports.readOnlyProp = readOnlyProp;
