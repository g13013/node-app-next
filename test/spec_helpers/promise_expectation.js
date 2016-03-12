function expectPromise(obj) {
  expect(obj && obj.then).toEqual(jasmine.any(Function), `object is not a valid promise`);
  expect(obj && obj.catch).toEqual(jasmine.any(Function), `object is not a valid promise`);
}

global.expectPromise = expectPromise;
