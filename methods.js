Meteor.methods({
  addVote: function (vote) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    var config = Accounts.loginServiceConfiguration.findOne({service: "github"});


    var doesVoteExist = Votes.find({
        userId:this.userId,
        issueId:vote.issueId,
        repoId:vote.repoId
    }).fetch()

    console.log(doesVoteExist)

    if(doesVoteExist.length === 0) {
        vote.userId = this.userId
        Votes.insert(vote)
    }

  }
});
