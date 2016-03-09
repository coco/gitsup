Meteor.methods({
  addVote: function (vote) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    var config = Accounts.loginServiceConfiguration.findOne({service: "github"});

    var votes = Votes.find({
        userId:this.userId,
        issueId:vote.issueId,
        repoId:vote.repoId
    }).fetch()

    if(votes.length === 0) {
        vote.userId = this.userId
        Votes.insert(vote)

        var tallys = Tallys.find({
            repoId: vote.repoId
        }).fetch()

        if(tallys.length === 0) {
            var issues = {}
            issues[vote.issueId] = 1
            Tallys.insert({
                repoId: vote.repoId,
                issues: issues
            })
        } else {
            var issues = tallys[0].issues
            if(typeof issues[vote.issueId] == 'undefined') {
                issues[vote.issueId] = 1
            } else {
                issues[vote.issueId] = issues[vote.issueId] + 1
            }
            Tallys.update({repoId: vote.repoId}, {$set: {issues: issues}})
        }
    }

  }
});
