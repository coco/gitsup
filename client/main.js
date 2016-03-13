var parser = document.createElement('a')
parser.href = document.location.href
var path = parser.pathname.split('/')

var username = path[1]
var repository = path[2]
var listType = path[3]
var issueNumber = path[4]

var repoId
var repoPath
var page = 1
var alreadyAdded = []

if(typeof repository == 'undefined') {
    return
}

var githubRequestData = {}

$(function() {
  // fire this immediately to prevent markup flickering
  $('ol.list').empty()

    // A hack to know when it's ready to get data
    Meteor.subscribe('default_db_data', function(){

        // set the access_token for requests if user is logged in
        if(Meteor.user()) {
            githubRequestData = {
                "access_token": Meteor.user().services.github.accessToken
            }
        }

        // define the title element (( should this be moved to a template helper with an inline handlebars method? ))
        $('title').text(username+'/'+repository+' · gitsup')
        if(typeof listType == 'undefined' || listType == "") {
           $('h2').html('<a href="https://github.com/'+username+'/'+repository+'">'+username+'/'+repository+'</a>')
           $('h2').after('<ul><li><a href="/'+username+'/'+repository+'/issues">issues</a></li><li><a href="/'+username+'/'+repository+'/pulls">pulls</a></li></ul>')
           listType = 'both'
        } else if(typeof issueNumber != 'undefined') {
           $('h2').html('<a href="https://github.com/'+username+'/'+repository+'/'+listType+'/'+issueNumber+'">'+username+'/'+repository+'/'+listType+'/'+issueNumber+'</a>')
           if(listType == 'pull') {
                listType = 'pulls'
           }
        } else {
           if(listType == 'pull') {
                listType = 'pulls'
           }
           $('h2').html('<a href="https://github.com/'+username+'/'+repository+'/'+listType+'">'+username+'/'+repository+'/'+listType+'</a>')
        }

        if(typeof issueNumber != 'undefined') {

            $('ol.list').before('<ol class="single" start="0"></ol>')

            $.ajax('https://api.github.com/repos/'+username+'/'+repository+'/issues/'+issueNumber, {
                data: githubRequestData,
                success: function(data) {
                    var votes = Votes.find({issueId:data.id}).fetch()
                    $('ol.single').prepend(buildItem(data, votes.length))
                    $('ol.single li.'+data.number+' .vote').click(clickVote)
               }
            })

        }

        console.log(githubRequestData)
        $.ajax('https://api.github.com/repos/'+username+'/'+repository, {
            data: githubRequestData,
            statusCode: {
              403: function (response) {
                 alert("Looks like you are at the GitHub API rate limit. Don't worry, you can sign in to keep browsing!");
              }
            },
            success: function(data) {
                repoId = data.id
                repoPath = data.full_name

                var repo = Repos.find({repoId:repoId}).fetch()[0]

                if (typeof repo !== 'undefined') {

                    function compare(a,b) {
                      if (a.votes < b.votes) {
                        return -1;
                      } else if (a.votes > b.votes) {
                        return 1;
                      } else {
                        return 0;
                      }
                    }

                    var issues = repo.issues.sort(compare)

                    for (i = 0; i < issues.length; i++) {
                        alreadyAdded.push(issues[i].number)
                        if(listType == 'both' || (issues[i].type == 'issue' && listType == 'issues') || (issues[i].type == 'pull' && listType == 'pulls')) {
                            var votes = issues[i].votes
                            $.ajax('https://api.github.com/repos/'+username+'/'+repository+'/issues/'+issues[i].number, {
                                data: githubRequestData,
                                success: (function(data, votes) {
                                    return function(data) {
                                        $('ol.list').prepend(buildItem(data, votes))
                                        $('ol.list li.'+data.number+' .vote').click(clickVote)
                                    }
                                })(data, votes)
                            })
                        }
                    }
                }

                var githubListType = listType
                if(listType == 'both') {
                    githubListType = 'issues'
                }
                $.ajax('https://api.github.com/repos/'+username+'/'+repository+'/'+githubListType, {
                    data: githubRequestData,
                    success: function(data) {
                        for (i = 0; i < data.length; i++) {
                          if(alreadyAdded.indexOf(data[i].number) == -1) {
                            if(listType == 'both' || (typeof data[i].pull_request == 'undefined' && listType == 'issues') || listType == 'pulls') {
                                $('ol.list').append(buildItem(data[i], 0))
                                $('ol.list li.'+data[i].number+' .vote').click(clickVote)
                            }
                          }
                        }

                        if(data.length >= 30) {
                            $('ol.list').after('<div class="showMore"><img src="/loading-bars.svg" alt="Loading.." class="loading-icon"/></div>')
                        }

                        var githubListType = listType
                        if (listType == 'both') {
                          githubListType = 'issues'
                        }

                        // requests the next page of issues from github
                        function showMore(data){
                          data = $.extend({}, data, githubRequestData)
                          page++
                          if($(".loading-icon")){$(".loading-icon").toggle()}
                          $.ajax({
                            url: 'https://api.github.com/repos/'+username+'/'+repository+'/'+githubListType+'?page='+page,
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
                                  $('ol.list').after('<div class="noMoreResults showMore">That\'s all the '+ githubListType +' for '+ repository +' :)</div>')
                                }
                              }
                              for (i = 0; i < data.length; i++) {
                                if(alreadyAdded.indexOf(data[i].number) == -1) {
                                    $('ol.list').append(buildItem(data[i], 0))
                                    $('ol.list li.'+data[i].number+' .vote').click(clickVote)
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
            }
        })
    })
})

function buildItem(item, votes) {
    var issueType
    if(typeof item.pull_request != 'undefined' || listType == 'pulls') {
        issueType = 'pull'
    } else {
        issueType = 'issue'
    }

    var githubLinkType = listType
    if (listType == 'pulls') {
        githubLinkType = 'pull'
    }
    if (listType == 'both') {
        githubLinkType = 'issues'
    }
    return '<li class="'+item.number+'">'+
              '<h3>'+
                '<a href="#'+item.number+'" class="vote" data-repo-id="'+repoId+'" data-repo-path="'+repoPath+'" data-issue-type="'+issueType+'" data-votes="'+votes+'" data-issue-id="'+item.id+'" data-issue-number="'+item.number+'"><img src="/vote.gif" alt="Vote" /></a> '+
                '<a href="'+item.html_url+'">'+item.title+'</a> '+
                '<span>(<a href="/'+username+'/'+repository+'/'+githubLinkType+'/'+item.number+'">#'+item.number+'</a>)</span>'+
              '</h3>'+
              '<p>'+
                '<span class="votes">'+
                  votes+
                '</span> '+
                '<span>'+
                ' votes by '+
                '</span> '+
                '<a href="'+item.user.html_url+'">'+item.user.login+'</a> '+
                '<span>'+
                  moment(item.created_at).fromNow()+' | '+
                '</span> '+
                '<a href="'+item.html_url+'">'+item.comments+' comments</a>'+
              '</p>'+
            '</li>'
}

function clickVote(e) {

      if(Meteor.userId() == null) {
         alert('Sorry, you need to sign in first.')
         return
      }

      var $el = $(e.currentTarget)
      var $votes = $el.closest('li').find('.votes')

      var repoId = $el.data('repoId')
      var repoPath = $el.data('repoPath')
      var issueId = $el.data('issueId')
      var issueNumber = $el.data('issueNumber')
      var issueType = $el.data('issueType')
      var votes = $el.data('votes')

      $votes.html(votes + 1)

      Meteor.call("addVote", {
          repoId:repoId,
          repoPath:repoPath,
          issueNumber:issueNumber,
          issueType:issueType,
          issueId:issueId
      })

      return false
}
