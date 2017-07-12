'use strict'

const path = require('path')
const session = require('koa-generic-session')
const RedisStore = require('koa-redis')
const responseTime = require('koa-response-time')
const logger = require('koa-logger')
const json = require('koa-json')
const compress = require('koa-compress')
const bodyParser = require('koa-bodyparser')
const cors = require('kcors')
const passport = require('koa-passport')
const config = require('./env')

module.exports = function(app) {
  if(app.env === 'development'){
    app.use(responseTime())
    app.use(logger())
  }
  app.use(cors({
    credentials: true
  }))
  app.use(bodyParser())
  app.use(json())
  app.keys = [config.session.secrets]
  app.use(session({
    key: 'jackblog.sid',
    store: RedisStore({
      host:config.redis.host,
      port:config.redis.port,
      auth_pass:config.redis.password || ''
    }),
    cookie: config.session.cookie
  }))
  app.use(passport.initialize())
  app.use(compress())
}
