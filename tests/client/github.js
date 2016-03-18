var _ = require('underscore');

describe('Github object', function() {
  it('.endpoint should be https://api.github.com @watch', function () {
    browser.url('http://localhost:3000');
    var ret = browser.execute(function() {return Github.endpoint});
    expect(ret.value).to.equal('https://api.github.com');
  });

  it('.userAgent should be support@gitsup.com @watch', function () {
    browser.url('http://localhost:3000');
    var ret = browser.execute(function() {return Github.userAgent});
    expect(ret.value).to.equal('support@gitsup.com');
  });

  it('.issues should fetch Github issues @watch', function (done) {
    browser.url('http://localhost:3000');
    var ret = browser.executeAsync(function(done) {
      Github.issues('gitsup', 'gitsup', function(res) { done(res); });
    });
    expect(typeof ret.value).to.equal('object')
  });



});
