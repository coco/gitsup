Meteor.methods({
    updateIssue: function (issue) {
        var existingIssue = Issues.find({id: issue.id}).fetch[0]

        if(typeof existingIssue != 'undefined') {
            Issues.update({id: issue.id}, {$set: issue})
        } else {
            Issues.insert(issue)
        }
    }
})
