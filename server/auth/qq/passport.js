'use strict'

const passport = require('koa-passport')
const qqStrategy = require('passport-qq').Strategy
const tools = require('../../util/tools')
const debug = require('../../util/debug')('auth:qq')

exports.setup = function (User,config) {
  passport.use(new qqStrategy({
      clientID: config.qq.clientID,
      clientSecret: config.qq.clientSecret,
      callbackURL: config.qq.callbackURL,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done)=> {
      var userId = req.session.passport.userId || null
      //profile._json.token = accessToken
      //如果userId不存在.而新建用户,否而更新用户.
      if(userId) return done(new Error('您已经是登录状态了'))
      try {
        const checkUserId = await User.findOne({'qq.id': profile.id})
        if(checkUserId) return done(null, checkUserId)
        let newUser = {
          nickname: profile._json.nickname || '',
          avatar:profile._json.figureurl_qq_2 || profile._json.figureurl_2 || '',
          provider: 'qq',
          qq: {
              id: profile.id,
              token: accessToken,
              name: profile._json.nickname || '',
              email: ''
          },
          status:1
        }
        const checkUserName = await User.findOne({nickname:newUser.nickname})
        if(checkUserName){
          newUser.nickname = tools.randomString()
        }
        const user = await new User(newUser).save()
        return done(null, user)       
      } catch (err) {
        debug('qqStrategy error')
        return done(err)       
      }
    }
  ))
}