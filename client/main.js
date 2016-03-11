var parser = document.createElement('a')
parser.href = document.location.href
var path = parser.pathname.split('/')

var username = path[1]
var repository = path[2]
var listType = path[3]
var issueNumber = path[4]

var repoId
var page = 1
var alreadyAdded = []


$(function() {

    if(typeof listType == 'undefined') {
        return;
    }

    // A hack to know when it's ready to get data
    Meteor.subscribe('default_db_data', function(){
        $('title').text(username+'/'+repository+'/'+listType+' · gitsup')
        $('h2').html('<a href="https://github.com/'+username+'/'+repository+'/'+listType+'">'+username+'/'+repository+'/'+listType+'</a>')

        $('ol.list').empty()

        if(typeof issueNumber != 'undefined') {

            $('ol.list').before('<ol class="single" start="0"></ol>')

            $.get('https://api.github.com/repos/'+username+'/'+repository+'/issues/'+issueNumber, function(data) {
                var votes = Votes.find({issueId:data.id}).fetch()
                $('ol.single').prepend(buildItem(data, votes.length))
                $('ol.single li.'+data.number+' .vote').click(clickVote)
            })

        }

        $.get('https://api.github.com/repos/'+username+'/'+repository, function(data) {
            repoId = data.id

            var repo = Repos.find({repoId:repoId}).fetch()[0]

            if (typeof repo !== 'undefined') {

                function compare(a,b) {
                  if (a.number < b.number) {
                    return -1;
                  } else if (a.number > b.number) {
                    return 1;
                  } else {
                    return 0;
                  }
                }

                var issues = repo.issues.sort(compare)

                for (i = 0; i < issues.length; i++) {
                    alreadyAdded.push(issues[i].number)
                    var votes = issues[i].votes
                    $.get('https://api.github.com/repos/'+username+'/'+repository+'/issues/'+issues[i].number, function(data) {
                        $('ol.list').prepend(buildItem(data, votes))
                        $('ol.list li.'+data.number+' .vote').click(clickVote)
                    })
                }
            }

            $.get('https://api.github.com/repos/'+username+'/'+repository+'/'+listType, function(data) {
                for (i = 0; i < data.length; i++) {
                  if(alreadyAdded.indexOf(String(data[i].number)) == -1) {
                      var votes
                      if (typeof repo == 'undefined') {
                        votes = 0
                      } else {
                        if(typeof repo.issues[data[i].number] == 'undefined') {
                            votes = 0
                        } else {
                            votes = repo.issues[data[i].number]
                        }
                      }

                      $('ol.list').append(buildItem(data[i], votes))
                      $('ol.list li.'+data[i].number+' .vote').click(clickVote)
                   }

                }
            })
        })

        $('ol.list').after('<div class="showMore"><a href="#">show more</a></div>')

        $('.showMore a').click(function() {

            page = page + 1

            $.get('https://api.github.com/repos/'+username+'/'+repository+'/'+listType+'?page='+page, function(data) {
                for (i = 0; i < data.length; i++) {
                  if(alreadyAdded.indexOf(data[i].number) == -1) {
                      var votes
                      if (typeof repo == 'undefined') {
                        votes = 0
                      } else {
                        if(typeof repo.issues[data[i].number] == 'undefined') {
                            votes = 0
                        } else {
                            votes = repo.issues[data[i].number]
                        }
                      }

                      $('ol.list').append(buildItem(data[i], votes))
                      $('ol.list li.'+data[i].number+' .vote').click(clickVote)
                   }

                }
            })
            return false
        })

    })
})

function buildItem(item, votes) {
    var issueType
    if(typeof item.pull_request == 'undefined') {
        issueType = 'issue'
    } else {
        issueType = 'pull'
    }
    return '<li class="'+item.number+'">'+
              '<h3>'+
                '<a href="#'+item.number+'" class="vote" data-issue-type="'+issueType+'" data-votes="'+votes+'" data-issue-id="'+item.id+'" data-issue-number="'+item.number+'"><img src="/vote.gif" alt="Vote" /></a> '+
                '<a href="'+item.html_url+'">'+item.title+'</a> '+
                '<span>(<a href="/'+username+'/'+repository+'/issues/'+item.number+'">#'+item.number+'</a>)</span>'+
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

      var issueId = $el.data('issueId')
      var issueNumber = $el.data('issueNumber')
      var issueType = $el.data('issueType')
      var votes = $el.data('votes')

      $votes.html(votes + 1)

      Meteor.call("addVote", {
          repoId:repoId,
          issueNumber:issueNumber,
          issueType:issueType,
          issueId:issueId
      })
      console.log(repoId, issueId, Meteor.userId())
      return false
}
