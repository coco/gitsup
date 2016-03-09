Meteor.publish('votes', function(){
    return Votes.findOne();
})
