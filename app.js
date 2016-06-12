Issues = new Mongo.Collection("issues")

if (Meteor.isClient) {
    var parser = document.createElement('a')
    parser.href = document.location.href
    var path = parser.pathname.split('/')

    var userName = path[1]
    var projectName = path[2]

    var state = { userName:userName, projectName:projectName }

    Meteor.call('syncIssues', state, function(err, response) {
        if(err) {
            Session.set('serverDataResponse', "Error:" + err.reason)
            return
        }
    })

    var page = 1

    function renderPage() {
        $('title').text(userName+'/'+projectName+' · gitsup')
        $('h2').html('<a href="https://github.com/'+userName+'/'+projectName+'">'+userName+'/'+projectName+'</a>')
        $('ol.list').empty()
    }

    function extendIssue(issue) {

        issue.userName = userName
        issue.projectName = projectName

        issue.votes = issue.reactions['+1']

        if(typeof issue.pull_request != 'undefined') {
            issue.type = 'pull'
        } else {
            issue.type = 'issue'
        }

        return issue
    }

    function renderIssue(issue) {
        return '<li class="'+issue.number+'">'+
                  '<h3>'+
                    '<a href="'+issue.html_url+'">'+issue.title+'<span> (#'+issue.number+')</span></a>'+
                  '</h3>'+
                  '<p>'+
                    '<span>'+
                      '<b>'+
                        issue.votes+' votes'+
                      '</b> '+
                      'by '+
                    '</span>'+
                    '<a href="'+issue.user.html_url+'">'+issue.user.login+'</a> '+
                    '<span>'+
                      moment(issue.created_at).fromNow()+' | '+
                    '</span> '+
                    '<a href="'+issue.html_url+'">'+issue.comments+' comments</a>'+
                  '</p>'+
                '</li>'
    }

    $(function() {
        Meteor.subscribe('issues', function(){
            var alreadyAdded = []
            var issues = Issues.find( {userName:userName, projectName:projectName}, {sort: {votes: 1}} ).fetch()

            if (typeof issues !== 'undefined') {
                for (i = 0; i < issues.length; i++) {
                    alreadyAdded.push(issues[i].number)
                    var issue = extendIssue(issues[i])
                    $('ol.list').prepend(renderIssue(issue))
                }
            }

            $.ajax('https://api.github.com/repos/'+userName+'/'+projectName+'/issues?state=all&sort=updated', {
                beforeSend: function(xhr){xhr.setRequestHeader('Accept', 'application/vnd.github.squirrel-girl-preview');},
                success: function(data) {
                    for (i = 0; i < data.length; i++) {
                      if(alreadyAdded.indexOf(data[i].number) == -1) {
                        var issue = extendIssue(data[i])

                        $('ol.list').append(renderIssue(issue))

                        Meteor.call("updateIssue", issue)

                      }
                    }

                    if(data.length >= 30) {
                        $('ol.list').after('<div class="showMore"><img src="/loading-bars.svg" alt="Loading.." class="loading-icon"/></div>')
                    }

                    // requests the next page of issues from github
                    function showMore(data){
                      page++
                      if($(".loading-icon")){$(".loading-icon").toggle()}
                      $.ajax({
                        url: 'https://api.github.com/repos/'+userName+'/'+projectName+'/issues?page='+page+'&state=all&sort=updated',
                        beforeSend: function(xhr){xhr.setRequestHeader('Accept', 'application/vnd.github.squirrel-girl-preview');},
                        statusCode: {
                          403: function (response) {
                             alert("Looks like you are at the GitHub API rate limit. Don't worry, you can sign in to keep browsing!");
                          }
                        },
                        data: data,
                        success: function(data){
                          if(data.length == 0){
                            if(!$(".noMoreResults").length){
                              $(".loading-icon").remove()
                              $('ol.list').after('<div class="noMoreResults showMore">That\'s all the issues for '+ projectName +' :)</div>')
                            }
                          }
                          for (j = 0; j < data.length; j++) {
                             if(alreadyAdded.indexOf(data[j].number) == -1) {
                                var issue = extendIssue(data[j])
                                $('ol.list').append(renderIssue(issue))
                                Meteor.call("updateIssue", issue)
                             }
                          }
                          if($(".loading-icon")){$(".loading-icon").toggle()}
                        },
                        failure: function(){console.log("failed to request more issues")},
                        dataType : "json",
                      });
                      return false
                    }

                    // infinite scroll feature
                    $(window).scroll(function() {
                       if($(window).scrollTop() + $(window).height() == $(document).height()) {
                         showMore()
                       }
                    });
                }
            })
        })
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
                        var existingIssue = Issues.find({id: issue.id}).fetch[0]

                        if(typeof existingIssue != 'undefined') {
                            Issues.update({id: issue.id}, {$set: issue})
                        } else {
                            Issues.insert(issue)
                        }
                    }

                    page = page + 1
                }

            }
        })

        // A hack to know when it's ready to get data
        Meteor.publish('default_db_data', function(){
            return Issues.find({},{limit:1})
        })
    })
}
