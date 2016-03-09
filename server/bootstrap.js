ServiceConfiguration.configurations.upsert({service: 'github'},{ $set: {
    clientId: process.env['GITHUB_CLIENT_ID'],
    secret: process.env['GITHUB_SECRET'],
    loginStyle: 'popup'
}})
