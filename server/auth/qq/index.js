'use strict'

const router = require('koa-router')()
var passport = require('koa-passport')
var config = require('../../config/env')
var auth = require('../auth.service')
const debug = require('../../util/debug')('auth:qq')

// qq ---------------------------------

router
  .get('/', auth.snsPassport(), passport.authenticate('qq', {
    failureRedirect: '/',
    session: false
  }))
  .get('/callback', async (ctx, next) => {
    await passport.authenticate('qq',{ session: false }, function (err, user, redirectURL){
      debug('qq auth callback start')
      const redirectUrl = ctx.session.passport.redirectUrl || '/'
      const cookieDomain = config.session.cookie.domain || null
      let snsmsg = {}
      if (err || !user) {
        snsmsg.msg = 'login failure'
        snsmsg.msgtype = 'error'
      }else{
        snsmsg.msgtype = 'success'
        snsmsg.msg  = 'login success!'
        const token = auth.signToken(user._id)
        debug('set cookie token')
        ctx.cookies.set('token',token,{ signed: false,domain:cookieDomain,httpOnly:false })
      }
      ctx.cookies.set('snsmsg',JSON.stringify(snsmsg),{ signed: false,domain:cookieDomain,httpOnly:false,maxAge:30000})
      return ctx.redirect(redirectUrl)
    })(ctx)
  })

module.exports = router
