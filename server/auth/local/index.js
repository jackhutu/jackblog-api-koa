'use strict'

const mongoose = require('mongoose')
const router = require('koa-router')()
const passport = require('koa-passport')
const User = mongoose.model('User')
const auth = require('../auth.service')

function checkCaptcha() {
  return async (ctx, next) => {
    //测试环境不用验证码
    let error_msg
    if(process.env.NODE_ENV !== 'test' && !ctx.req.headers.jackblog){
      if(!ctx.request.body.captcha){
        error_msg = '验证码不能为空.'
      }else if(ctx.session.captcha !== ctx.request.body.captcha.toLowerCase()){
        error_msg = '验证码错误.'
      }else if(ctx.request.body.email === '' || ctx.request.body.password === ''){
        error_msg = '用户名和密码不能为空.'
      }
    }
    if(error_msg){
      ctx.status = 422
      return ctx.body = {error_msg:error_msg}
    }
    await next()
  }
}

router.post('/', checkCaptcha(), async (ctx,next) =>{
  await passport.authenticate('local', async (err, user, info)=> {
    if (err) ctx.throw(err)
    if(info){
      ctx.status = 403
      return ctx.body = info
    }
    const token = auth.signToken(user._id)
    ctx.body = {token: token}
  })(ctx, next)
})

module.exports = router
