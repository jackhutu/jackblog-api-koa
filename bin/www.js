#!/usr/bin/env node
const app = require('../server/app')
const config = require('../server/config/env')

// Start server
app.listen(config.port, function () {
  console.log('Koa server listening on %d, in %s mode', config.port, app.env)
})
