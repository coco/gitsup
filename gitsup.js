Votes = new Mongo.Collection("votes")

if (Meteor.isClient) {

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
                $.get('https://api.github.com/repos/'+username+'/'+repository+'/'+listType, function(data) {
                    $('ol').empty()
                    for (i = 0; i < data.length; i++) {
                      var votes = Votes.find({issueId:data[i].id}).fetch().length
                      $('ol').append(
                        '<li>'+
                          '<h3>'+
                            '<a href="#'+data[i].number+'" class="vote" data-issue-id="'+data[i].id+'"><img src="/vote.gif" alt="Vote" /></a> '+
                            '<a href="'+data[i].html_url+'">'+data[i].title+'</a> '+
                            '<span>(<a href="'+data[i].html_url+'">#'+data[i].number+'</a>)</span>'+
                          '</h3>'+
                          '<p>'+
                            '<span>'+
                              votes+' points by'+
                            '</span> '+
                            '<a href="'+data[i].user.html_url+'">'+data[i].user.login+'</a> '+
                            '<span>'+
                              '2 hours ago |'+
                            '</span> '+
                            '<a href="'+data[i].html_url+'">'+data[i].comments+' comments</a>'+
                          '</p>'+
                        '</li>'
                      )
                      $($('ol li .vote')[i]).click(function(e){
                          var issueId = $(e.currentTarget).data('issueId')
                          Votes.insert({repoId:repoId, issueId:issueId})
                          console.log(repoId, issueId)
                          return false
                      })
                    }
                })
            })
        })
    })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // A hack to know when it's ready to get data
    Meteor.publish('default_db_data', function(){
        return Votes.find({},{limit:1})
    })
  });
}


