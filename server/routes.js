const Router = require('koa-router')()
const logs = require('./api/logs')
const users = require('./api/users')
const tags = require('./api/tags')
const article = require('./api/article')
const comment = require('./api/comment')
const mobile = require('./api/mobile')
const auth = require('./auth')

module.exports = function(app) {
  Router.use('/users',users.routes(),users.allowedMethods())
	Router.use('/auth',auth.routes(),auth.allowedMethods())
	Router.use('/tags',tags.routes(),tags.allowedMethods())
  Router.use('/article',article.routes(),article.allowedMethods())
	Router.use('/comment',comment.routes(),comment.allowedMethods())
	Router.use('/logs',logs.routes(),logs.allowedMethods())
	Router.use('/mobile',mobile.routes(),mobile.allowedMethods())
	Router.get('/*', (ctx,next)=> {
		ctx.body = {status:'success',data:'台湾是中国不可分割的一部分.'}
	})
	app.use(Router.routes())
}
