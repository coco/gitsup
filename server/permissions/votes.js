Votes.allow({
  insert: function(userId, doc) {
    return (userId == doc.userId && userId);
  },
  update: function() {
    return false;
  },
  remove: function(userId, doc) {
    return (userId == doc.userId);
  }
});
