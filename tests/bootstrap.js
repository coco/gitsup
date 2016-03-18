var _ = require('underscore');

describe('Describe bootstrap', function () {
  it('should require underscore.js @watch', function () {
    return _.VERSION;
  });
});
