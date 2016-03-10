var parser = document.createElement('a')
parser.href = document.location.href
var path = parser.pathname.split('/')

var username = path[1]
var repository = path[2]
var listType = path[3]

var repoId
var page = 1
var alreadyAdded = []


$(function() {

    if(typeof path[3] == 'undefined') {
        return;
    }

    // A hack to know when it's ready to get data
    Meteor.subscribe('default_db_data', function(){
        $('title').text(username+'/'+repository+'/'+listType+' · gitsup')
        $('h2').html('<a href="https://github.com/'+username+'/'+repository+'/'+listType+'">'+username+'/'+repository+'/'+listType+'</a>')

        $('ol').empty()

        $.get('https://api.github.com/repos/'+username+'/'+repository, function(data) {
            repoId = data.id

            var tally = Tallys.find({repoId:repoId}).fetch()[0]

            if (typeof tally !== 'undefined') {
                $.each(tally.issues, function(key, value) {

                    alreadyAdded.push(key)

                    $.get('https://api.github.com/repos/'+username+'/'+repository+'/issues/'+key, function(data) {
                        $('ol').prepend(buildItem(data, tally.issues[data.number]))
                        $('ol li.'+data.number+' .vote').click(clickVote)
                    })
                })
            }

            $.get('https://api.github.com/repos/'+username+'/'+repository+'/'+listType, function(data) {
                for (i = 0; i < data.length; i++) {
                  if(alreadyAdded.indexOf(data[i].number) == -1) {
                      var votes
                      if (typeof tally == 'undefined') {
                        votes = 0
                      } else {
                        if(typeof tally.issues[data[i].number] == 'undefined') {
                            votes = 0
                        } else {
                            votes = tally.issues[data[i].number]
                        }
                      }

                      $('ol').append(buildItem(data[i], votes))
                      $('ol li.'+data[i].number+' .vote').click(clickVote)
                   }

                }
            })
        })

        $('ol').after('<div class="showMore"><a href="#">show more</a></div>')

        $('.showMore a').click(function() {

            page = page + 1

            $.get('https://api.github.com/repos/'+username+'/'+repository+'/'+listType+'?page='+page, function(data) {
                for (i = 0; i < data.length; i++) {
                  if(alreadyAdded.indexOf(data[i].number) == -1) {
                      var votes
                      if (typeof tally == 'undefined') {
                        votes = 0
                      } else {
                        if(typeof tally.issues[data[i].number] == 'undefined') {
                            votes = 0
                        } else {
                            votes = tally.issues[data[i].number]
                        }
                      }

                      $('ol').append(buildItem(data[i], votes))
                      $('ol li.'+data[i].number+' .vote').click(clickVote)
                   }

                }
            })
            return false
        })

    })
})

function buildItem(item, votes) {
    return '<li class="'+item.number+'">'+
              '<h3>'+
                '<a href="#'+item.number+'" class="vote" data-votes="'+votes+'" data-issue-id="'+item.id+'" data-issue-number="'+item.number+'"><img src="/vote.gif" alt="Vote" /></a> '+
                '<a href="'+item.html_url+'">'+item.title+'</a> '+
                '<span>(<a href="'+item.html_url+'">#'+item.number+'</a>)</span>'+
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
      var votes = $el.data('votes')

      $votes.html(votes + 1)

      Meteor.call("addVote", {
          repoId:repoId,
          issueNumber:issueNumber,
          issueId:issueId
      })
      console.log(repoId, issueId, Meteor.userId())
      return false
}
