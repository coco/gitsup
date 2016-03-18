var _ = require('underscore');

describe('Routes', function() {

  it('should have a homepage @watch', function () {
    browser.url('http://localhost:3000');
    expect(browser.execute(function() {
      return Router.current()._handled;
    }).value)
    .to.equal(true);
  });

  _.each(['issues','pulls', ''], function(filter) {
    it('should have /gitsup/gitsup/' + filter + ' issues route @watch', function () {
      browser.url('http://localhost:3000/gitsup/gitsup/' + filter);
      expect(browser.execute(function() {
        return Router.current()._handled;
      }).value)
      .to.equal(true);
    });
  });

});
