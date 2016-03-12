'use strict';

var transform = require(global.LIB_DIR + '/helpers/string_transform.js');

describe('string_transform', function () {
  beforeEach(function () {
    transform.unregisterPrototype();
  })

  describe('as helpers', function () {
    it('#classify', function () {
      expect(() => {transform.classify(null);}).toThrow('classify: expected a string but got "object"');
      expect(transform.classify('someClass')).toBe('SomeClass');
      expect(transform.classify('some-Class')).toBe('SomeClass');
      expect(transform.classify('some_Class')).toBe('SomeClass');
    });

    it('#camelize', function () {
      expect(() => transform.camelize(null)).toThrow('camelize: expected a string but got "object"');
      expect(transform.camelize('someClass')).toBe('someClass');
      expect(transform.camelize('some class')).toBe('someClass');
      expect(transform.camelize('some-Class')).toBe('someClass');
      expect(transform.camelize('some_Class')).toBe('someClass');
    });

    it('#capitalize', function () {
      expect(() => transform.capitalize(null)).toThrow('capitalize: expected a string but got "object"');
      // note: the second pass checks cached results;
      expect(transform.capitalize('someWord')).toBe('SomeWord');
      expect(transform.capitalize('someWord')).toBe('SomeWord');
      expect(transform.capitalize('some-Word')).toBe('Some-Word');
      expect(transform.capitalize('some-Word')).toBe('Some-Word');
      expect(transform.capitalize('some_Word')).toBe('Some_Word');
      expect(transform.capitalize('some_Word')).toBe('Some_Word');
      expect(transform.capitalize('some Word')).toBe('Some Word');
      expect(transform.capitalize('some Word')).toBe('Some Word');
      expect(transform.capitalize('some word')).toBe('Some word');
      expect(transform.capitalize('some word')).toBe('Some word');
      expect(transform.capitalize('Word')).toBe('Word');
      expect(transform.capitalize('Word')).toBe('Word');
    });
  });

  describe('String.prototype', function () {
    it('#registerPrototype', function () {
      expect('someClass'.classified).toBe(undefined);
      expect('some class'.camelized).toBe(undefined);
      expect('someWord'.capitalized).toBe(undefined);
      transform.registerPrototype();
      expect('someClass'.classified).toBe('SomeClass');
      expect('some class'.camelized).toBe('someClass');
      expect('someWord'.capitalized).toBe('SomeWord');
      expect(() => 'someClass'.classified = 'ded').toThrow();
      expect(() => 'some class'.camelized = 'ded').toThrow();
      expect(() => 'someWord'.capitalized = 'ded').toThrow();
    });

    it('#registerPrototype with existing key', function () {
      String.prototype.classified = undefined;
      transform.registerPrototype();
      expect('someClass'.classified).toBe(String.prototype.classified);
      expect('some class'.camelized).toBe('someClass');
      expect('someWord'.capitalized).toBe('SomeWord');
      delete String.prototype.classified;
    });

    it('#unregisterPrototype', function () {
      transform.registerPrototype();
      transform.unregisterPrototype();
      expect('someClass'.classified).toBe(undefined);
      expect('some class'.camelized).toBe(undefined);
      expect('someWord'.capitalized).toBe(undefined);
    });
  });
});
