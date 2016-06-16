Issues = new Mongo.Collection("issues")

if (Meteor.isClient) {
    var parser = document.createElement('a')
    parser.href = document.location.href
    var path = parser.pathname.split('/')

    var userName = path[1]
    var projectName = path[2]

    var state = { userName:userName, projectName:projectName }

    Meteor.call('syncIssues', state)

    Template.issues.helpers({
        items: function() {
            return Issues.find(state, {sort:{votes: -1, comments: -1}})
        }
    })
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        Meteor.methods({
            syncIssues: function (state) {
                var userName = state.userName
                var projectName = state.projectName
                var apiURL = 'https://api.github.com/repos/'+userName+'/'+projectName+'/issues'
                var page = 1

                while(page) {

                    var issues = HTTP.call('GET', apiURL, {
                        params: {
                            page: page,
                            state: "all",
                            access_token: Meteor.settings.githubToken,
                        }, headers: {
                            "User-Agent":"gitsup",
                            "Accept":"application/vnd.github.squirrel-girl-preview"
                        }
                    }).data

                    if(issues.length < 1) {
                        break
                    }

                    for(var i = 0; i < issues.length; i++) {

                        var issue = issues[i]

                        var item = {
                            userName: userName,
                            projectName: projectName,
                            votes: issue.reactions['+1'],
                            title: issue.title,
                            number: issue.number,
                            state: issue.state,
                            comments: issue.comments,
                            html_url: issue.html_url
                        }

                        var existingIssue = Issues.find({id: issue.id, userName: userName, projectName: projectName}).fetch()[0]

                        if(typeof existingIssue != 'undefined') {
                            Issues.update({id: issue.id, userName: userName, projectName: projectName}, {$set: item})
                        } else {
                            Issues.insert(item)
                        }
                    }

                    page = page + 1
                }
            }
        })
    })
}
