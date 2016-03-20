/* Github object
* =============
*
* Exports Github related stuff, like `endpoint`.
*/

Github = {
  endpoint: 'https://api.github.com',

  userAgent: 'support@gitsup.com',

  issues: function(user, repo, callback) {
    callback = callback || function() {};
    var self = this;
    var endpoint = self.endpoint;
    var issuesUrl = [endpoint, 'repos', user, repo, 'issues'].join('/');

    var requestOptions = {
      headers: {
        'Origin': 'http://localhost',
        'user-agent': self.userAgent
      }
    };

    console.log('[Github issues]', issuesUrl)
    HTTP.get(issuesUrl, requestOptions, function(err, result) {
      if (err) {
        console.log('ERROR: ', err);
        return(err);
      }
      console.log(result.data);
      return callback(result.data);
    });
  }
}
