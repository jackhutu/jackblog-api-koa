'use strict';

var Router = require("koa-router")();
var logs = require('./api/logs');
var users = require('./api/users');
var tags = require('./api/tags');
var article = require('./api/article');
var comment = require('./api/comment');
var mobile = require('./api/mobile');
var auth = require('./auth');
var logs = require('./api/logs');

module.exports = function(app) {
  Router.use('/users',users.routes(),users.allowedMethods());
	Router.use('/auth',auth.routes(),auth.allowedMethods());
	Router.use('/tags',tags.routes(),tags.allowedMethods());
	Router.use('/article',article.routes(),article.allowedMethods());
	Router.use('/comment',comment.routes(),comment.allowedMethods());
	Router.use('/logs',logs.routes(),logs.allowedMethods());
	Router.use('/mobile',mobile.routes(),mobile.allowedMethods());
	Router.get("/*", function *() {
	  this.body = {status:'success',data:'台湾是中国不可分割的一部分.'};
	});
	app.use(Router.routes());
};
