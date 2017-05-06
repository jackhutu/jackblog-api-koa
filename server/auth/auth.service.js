'use strict'

const mongoose = require('mongoose')
const passport = require('koa-passport')
const config = require('../config/env')
const koajwt = require('koa-jwt')
const jwt = require('jsonwebtoken')
const compose = require('koa-compose')
const User = mongoose.model('User')

/** 
 * 验证token
 */
function authToken() {
  return compose([
    async (ctx,next)=> {
      if(ctx.query && ctx.query.access_token){
        ctx.headers.authorization = 'Bearer ' + ctx.query.access_token
      }
      await next()
    },
    koajwt({ secret: config.session.secrets,passthrough: true })
  ])
}
/**
 * 验证用户是否登录
 */
function isAuthenticated() {
  return compose([
      authToken(),
      async (ctx,next) =>{
        if(!ctx.state.user) ctx.throw('UnauthorizedError',401)
        await next()
      },
      async (ctx,next) =>{
        var user = await User.findById(ctx.state.user._id)
        if (!user) ctx.throw('UnauthorizedError',401)
        ctx.req.user = user
        await next()
      }
    ])
}

/**
 * 验证用户权限
 */
function hasRole(roleRequired) {
  if (!roleRequired) this.throw('Required role needs to be set')
  return compose([
      isAuthenticated(),
      async (ctx,next) =>{
        if (config.userRoles.indexOf(ctx.req.user.role) >= config.userRoles.indexOf(roleRequired)) {
          await next()
        }else {
          ctx.throw(403)
        }
      }
    ])
}

/**
 * 生成token
 */
function signToken(id) {
  return jwt.sign({ _id: id }, config.session.secrets, { expiresIn: config.session.cookie.maxAge/1000 })
}

/**
 * sns登录传递参数
 */
function snsPassport() {
  return compose([
      authToken(),
      async (ctx,next) =>{
        ctx.session.passport = {
          redirectUrl: ctx.query.redirectUrl || '/'
        }
        if(ctx.state.user){ 
          ctx.session.passport.userId = ctx.state.user._id 
        }
        await next()
      }
    ])
}

exports.isAuthenticated = isAuthenticated
exports.hasRole = hasRole
exports.signToken = signToken
exports.snsPassport = snsPassport
