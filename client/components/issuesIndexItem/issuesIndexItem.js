Template.issuesIndexItem.onCreated(function() {
  Meteor.subscribe('votes', this.data.id);
});

Template.issuesIndexItem.onDestroyed(function() {
  Meteor.subscribe('votes', this.data.id).stop();
});

Template.issuesIndexItem.helpers({
  votes: function() {
    return Votes.find({issueId: Template.instance().data.id});
  },
  votesCount: function() {
    return Votes.find({issueId: Template.instance().data.id}).count() ;
  }
});

Template.issuesIndexItem.events({
  'click [data-action="vote"]': function(event, template) {
    event.preventDefault();

    if (_.isNull(Meteor.user())) {
      alert("You need to sign in first.");
      throw new Meteor.Error('Non authenticated');
    }

    var query = {
      issueId: template.data.id,
      userId: Meteor.userId()
    };
    var count = Votes.find(query).count();

    if (count == 0) {
      Votes.insert(query);
    } else {
      Votes.remove(Votes.findOne(query)._id);
    }

  }
})
