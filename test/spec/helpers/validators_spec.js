describe('validators', function () {
  it('instance of koa-joi-router#Joi', function () {
    this.require('helpers/validators') === require('koa-joi-router').Joi;
  });
})
