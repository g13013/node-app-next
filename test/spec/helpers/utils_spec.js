describe('utils', function () {
  it('instance of lodash', function () {
    this.require('helpers/utils') === require('lodash');
  });

  it('#classify()/#pascalCase()', function () {
    var util = this.require('helpers/utils');
    expect(util.classify).toBe(util.pascalCase);
    expect(util.pascalCase('someClass')).toBe('SomeClass');
    expect(util.pascalCase('some-Class')).toBe('SomeClass');
    expect(util.pascalCase('some_Class')).toBe('SomeClass');
  })
})
