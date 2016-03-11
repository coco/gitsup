Meteor.methods({
  addVote: function (vote) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    var votes = Votes.find({
        userId:this.userId,
        issueType:vote.issueType,
        issueId:vote.issueId,
        issueNumber:vote.issueNumber,
        repoId:vote.repoId
    }).fetch()

    if(votes.length === 0) {
        vote.userId = this.userId
        Votes.insert(vote)

        var repos = Repos.find({
            repoId: vote.repoId
        }).fetch()

        if(repos.length === 0) {
            var issues = {}
            issues[vote.issueNumber] = 1
            Repos.insert({
                repoId: vote.repoId,
                issues: [{
                    votes: 1,
                    type: vote.issueType,
                    number: vote.issueNumber,
                    id: vote.issueId
                }]
            })
        } else {
            var issues = repos[0].issues

            var issueExists = false
            for (i = 0; i < issues.length; i++) {
                if(issues[i].id == vote.issueId) {
                    issueExists = true
                    issues[i].votes = issues[i].votes + 1
                }
            }

            if(!issueExists) {
                issues.push({
                    votes: 1,
                    type: vote.issueType,
                    number: vote.issueNumber,
                    id: vote.issueId
                })
            }

            Repos.update({repoId: vote.repoId}, {$set: {issues: issues}})
        }
    }

  }
});
