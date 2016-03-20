/* Github object
* =============
*
* Exports Github related stuff, like `endpoint`.
*/

Github = {
  endpoint: 'https://api.github.com',

  userAgent: 'support@gitsup.com',

  issues: function(user, repo, token, callback) {

    // Handles Github.issues(user, repo)
    if (_.isUndefined(token) && _.isUndefined(callback)) {
      throw new Meteor.Error('No callback passed.');
    }

    // Handles Github.issues(user, repo, callback)
    if (_.isFunction(token) && _.isUndefined(callback)) {
      callback = token;
      token = false;
    }

    var self = this;
    var endpoint = self.endpoint;
    var issuesUrl = [endpoint, 'repos', user, repo, 'issues'].join('/');

    var requestOptions = {
      headers: {
        'Origin': 'http://localhost',
        'user-agent': self.userAgent
      }
    };

    HTTP.get(issuesUrl, requestOptions, function(err, result) {
      if (err) {
        console.log('ERROR: ', err);
      }
      return callback(err, result.data);
    });
  }
}
