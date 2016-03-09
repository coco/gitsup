Meteor.methods({
  addVote: function (vote) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Vote.insert(vote);
  }
});
