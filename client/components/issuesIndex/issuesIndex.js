Template.issuesIndex.helpers({
  example: function() {
    return 'https://github.com/' + this.user + '/' + this.project + '/issues';
  },
  issues: function() {
    var user = this.user;
    var project = this.project;
    
  }
});
