var parser = document.createElement('a')
parser.href = document.location.href
var path = parser.pathname.split('/')

var username = path[1]
var repository = path[2]
var listType = path[3]

$(function() {

    if(typeof path[3] == 'undefined') {
        return;
    }

    // A hack to know when it's ready to get data
    Meteor.subscribe('default_db_data', function(){
        $('title').text(username+'/'+repository+'/'+listType+' · gitsup')
        $('h2').html('<a href="https://github.com/'+username+'/'+repository+'/'+listType+'">'+username+'/'+repository+'/'+listType+'</a>')

        var repoId;
        $.get('https://api.github.com/repos/'+username+'/'+repository, function(data) {
            repoId = data.id
            var tally = Tallys.find({repoId:repoId}).fetch()[0]

            console.log(tally)

            $.get('https://api.github.com/repos/'+username+'/'+repository+'/'+listType, function(data) {
                $('ol').empty()
                for (i = 0; i < data.length; i++) {

                  var votes
                  if (typeof tally == 'undefined') {
                    votes = 0
                  } else {
                    if(typeof tally.issues[data[i].id] == 'undefined') {
                        votes = 0
                    } else {
                        votes = tally.issues[data[i].id]
                    }
                  }

                  $('ol').append(
                    '<li>'+
                      '<h3>'+
                        '<a href="#'+data[i].number+'" class="vote" data-votes="'+votes+'" data-issue-id="'+data[i].id+'"><img src="/vote.gif" alt="Vote" /></a> '+
                        '<a href="'+data[i].html_url+'">'+data[i].title+'</a> '+
                        '<span>(<a href="'+data[i].html_url+'">#'+data[i].number+'</a>)</span>'+
                      '</h3>'+
                      '<p>'+
                        '<span class="votes">'+
                          votes+
                        '</span> '+
                        '<span>'+
                        ' votes by '+
                        '</span> '+
                        '<a href="'+data[i].user.html_url+'">'+data[i].user.login+'</a> '+
                        '<span>'+
                          moment(data[i].created_at).fromNow()+' | '+
                        '</span> '+
                        '<a href="'+data[i].html_url+'">'+data[i].comments+' comments</a>'+
                      '</p>'+
                    '</li>'
                  )
                  $($('ol li .vote')[i]).click(function(e){
                      var $el = $(e.currentTarget)
                      var $votes = $el.closest('li').find('.votes')

                      var issueId = $el.data('issueId')
                      var votes = $el.data('votes')

                      $votes.html(votes + 1)

                      Meteor.call("addVote", {repoId:repoId, issueId:issueId})
                      console.log(repoId, issueId, Meteor.userId())
                      return false
                  })
                }
            })
        })
    })
})
