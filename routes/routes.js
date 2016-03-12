Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function() {
  this.render('home');
});

/* Issues route
*
*  /user/project/
*  /user/project/issues
*  /user/project/pulls
*
*  It passes view user, project and filter parameters. Filter
*  parameter can be one of "issues", "pulls" or "all".
*/
_.each(['issues', 'pulls', ''], function(filter) {
  var issuesRoute = '/:user/:project/' + filter;

  Router.route(issuesRoute, function() {
    this.render('issuesIndex', {
      data: function() {
        return {
          user: this.params.user,
          project: this.params.project,
          filter: filter || 'all'
        }
      }
    });
  });

});
