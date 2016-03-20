var _ = require('underscore');


describe('Github object', function() {
  beforeEach(function() {
  });

  it('.endpoint should be https://api.github.com @watch', function () {
    browser.url('http://localhost:3000');
    var ret = browser.execute(function() {return Github.endpoint});
    expect(ret.value).to.equal('https://api.github.com');
  });

  it('.userAgent should be support@gitsup.com @watch', function () {
    var ret = browser.execute(function() {return Github.userAgent});
    expect(ret.value).to.equal('support@gitsup.com');
  });

  it('.issues should fetch Github issues @watch', function () {
    var githubResponse = browser.executeAsync(function(next) {
      Github.issues('gitsup', 'gitsup', function(res) {
        next(res);
      })
    });
    expect(typeof githubResponse).to.equal('object')
  });
});
