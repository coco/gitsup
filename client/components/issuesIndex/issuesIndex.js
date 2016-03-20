Template.issuesIndex.onCreated(function() {
  var self = this;

  this.issues = new ReactiveVar();

  Github.issues(self.data.user, self.data.project, function(err, response) {
    self.issues.set(response);
  });
});

Template.issuesIndex.helpers({
  example: function() {
    return 'https://github.com/' + this.user + '/' + this.project + '/issues';
  },
  issues: function() {
    return Template.instance().issues.get();
  }
});
