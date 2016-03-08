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

        $('title').text(username+'/'+repository+'/'+listType+' · gitsup')
        $('h2').html('<a href="https://github.com/'+username+'/'+repository+'/'+listType+'">'+username+'/'+repository+'/'+listType+'</a>')

        $.get('https://api.github.com/repos/'+username+'/'+repository+'/'+listType, function(data) {
            console.log(data)
            $('ol').empty()
            for (i = 0; i < data.length; i++) {
              $('ol').append(
                '<li>'+
                  '<h3>'+
                    '<a href="#'+data[i].number+'"><img src="/vote.gif" alt="Vote" /></a> '+
                    '<a href="'+data[i].html_url+'">'+data[i].title+'</a> '+
                    '<span>(<a href="'+data[i].html_url+'">#'+data[i].number+'</a>)</span>'+
                  '</h3>'+
                  '<p>'+
                    '<span>'+
                      '3 points by'+
                    '</span> '+
                    '<a href="'+data[i].user.html_url+'">'+data[i].user.login+'</a> '+
                    '<span>'+
                      '2 hours ago |'+
                    '</span> '+
                    '<a href="'+data[i].comments_url+'">'+data[i].comments+' comments</a>'+
                  '</p>'+
                '</li>'
              )
            }
        })
    })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}


