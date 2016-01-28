'use strict';

const mongoose = require('mongoose');
const router = require("koa-router")();
const passport = require('koa-passport');
const auth = require('../auth.service');
const User = mongoose.model('User');

function checkCaptcha() {
  return function *(next) {
    //测试环境不用验证码
    let error_msg;
    if(process.env.NODE_ENV !== 'test'){
      if(!this.request.body.captcha){
        error_msg = "验证码不能为空.";
      }else if(this.session.captcha !== this.request.body.captcha.toUpperCase()){
        error_msg = "验证码错误.";
      }else if(this.request.body.email === '' || this.request.body.password === ''){
        error_msg = "用户名和密码不能为空.";
      }
    }
    if(error_msg){
      this.status = 400;
      return this.body = {error_msg:error_msg}
    }
    yield next;
  }
}

router.post('/', checkCaptcha(), function*(next) {
  var ctx = this
  yield passport.authenticate('local', function*(err, user, info) {
    if (err) ctx.throw(err);
    if(info){
      ctx.status = 403;
      return ctx.body = info;
    }
    const token = auth.signToken(user._id);
    ctx.body = {token: token};
  }).call(this, next)
})
module.exports = router;
