Issues = new Mongo.Collection("issues")
Projects = new Mongo.Collection("projects")

if (Meteor.isClient) {
    var parser = document.createElement('a')
    parser.href = document.location.href
    var path = parser.pathname.split('/')

    var userName = path[1]
    var projectName = path[2]

    var state = {
        userName: userName, 
        projectName: projectName
    }

    Meteor.call('syncIssues', state)

    Session.setDefault('itemsLimit', 100)

    Meteor.subscribe('issues', state, Session.get('itemsLimit'))

    Template.issues.helpers({
        items: function() {
            return Issues.find({})
        }
    })

    setInterval(function() {
        if($('ol li').length) {
            $('#loader').remove()
        }
    }, 500)
}

if (Meteor.isServer) {
    Meteor.publish('issues', function(state, limit) {
        return Issues.find({
            userName:state.userName,
            projectName:state.projectName
        },{
            sort:{ votes: -1, comments: -1 },
            limit: limit
        })
    })
    Meteor.startup(function () {
        Meteor.methods({
            syncIssues: function (state) {
                var userName = state.userName
                var projectName = state.projectName
                var shouldUpdateIssues = true

                var existingProject = Projects.find({userName:userName,projectName:projectName}).fetch()[0]

                var projectData = {
                    userName: userName,
                    projectName: projectName,
                    lastUpdate: Date.now()
                }

                if(typeof existingProject != 'undefined') {
                    Projects.update({userName: userName, projectName: projectName}, {$set: projectData})

                    if(Date.now() - existingProject.lastUpdate < 3600000) {
                       shouldUpdateIssues = false 
                    }
                } else {
                    Projects.insert(projectData)
                }

                if(shouldUpdateIssues) {

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
                                id: issue.id,
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
            }
        })
    })
}
