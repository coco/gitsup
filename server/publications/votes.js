Meteor.publish('votes', function(issueId){
  return Votes.find({issueId: issueId});
})
