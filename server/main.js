Meteor.startup(function () {
    // A hack to know when it's ready to get data
    Meteor.publish('default_db_data', function(){
        return Votes.find({},{limit:1})
    })
})
