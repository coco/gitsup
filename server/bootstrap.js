ServiceConfiguration.configurations.upsert( { service: 'github' }, {
    $set: Meteor.settings.private.oAuth.github
});
