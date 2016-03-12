Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function() {
  this.render('home');
});

Router.route('/:user/:project/issues', function() {
  this.render('issuesIndex', {
    data: function() {
      return {
        user: this.params.user,
        project: this.params.project
      }
    }
  });
});

Router.route('/:user/:project/pulls', function() {
  this.render('pullsIndex', {
    data: function() {
      return {
        user: this.params.user,
        project: this.params.project
      }
    }
  });
});
