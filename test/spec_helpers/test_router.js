beforeEach(function () {
  this.newRouter = () => jasmine.createSpyObj('router',['listen', 'get', 'use', 'middleware', 'post', 'get', 'head', 'put', 'delete', 'del']);
})
