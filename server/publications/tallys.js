Meteor.publish('tallys', function(){
    return Tallys.find();
})
