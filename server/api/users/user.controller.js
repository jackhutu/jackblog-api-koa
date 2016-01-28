'use strict';

const mongoose = require('mongoose');
const User = mongoose.model('User');
const Logs = mongoose.model('Logs');
const ccap = require('ccap')();
const config = require('../../config/env')
/**
 * 获取验证码
 */
exports.getCaptcha = function *() {
	const ary = ccap.get();
	const txt = ary[0];
	const buf = ary[1];
	this.session.captcha = txt;
	this.status = 200;
	this.body = buf;
}

exports.getMe = function *() {
	const userId = this.req.user._id;
	try{
		const user = yield User.findById(userId);
		this.status = 200;
		this.body = user.userInfo;
	}catch(err){
		this.throw(err);
	}
}
//后台获取用户列表
exports.getUserList = function *() {
	let currentPage = (parseInt(this.query.currentPage) > 0)?parseInt(this.query.currentPage):1;
	let itemsPerPage = (parseInt(this.query.itemsPerPage) > 0)?parseInt(this.query.itemsPerPage):10;
	let startRow = (currentPage - 1) * itemsPerPage;

	let sortName = String(this.query.sortName) || "created";
	let sortOrder = this.query.sortOrder;
	if(sortOrder === 'false'){
		sortName = "-" + sortName;
	}
	try{
		const count = yield User.count();
		const userList = yield User.find({}).skip(startRow).limit(itemsPerPage).sort(sortName).exec();
		this.status = 200;
		this.body = { data: userList, count:count };
	}catch(err){
		this.throw(err);
	}
}

//添加用户
exports.addUser = function *() {
	const nickname = this.request.body.nickname?this.request.body.nickname.replace(/(^\s+)|(\s+$)/g, ""):'';
	const email = this.request.body.email?this.request.body.email.replace(/(^\s+)|(\s+$)/g, ""):'';
	const NICKNAME_REGEXP = /^[(\u4e00-\u9fa5)0-9a-zA-Z\_\s@]+$/;
  const EMAIL_REGEXP = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
	let error_msg;
	if(nickname === ''){
		error_msg = "呢称不能为空";
	}else if(email === ''){
		error_msg = "邮箱地址不能为空";
	}else if(nickname.length <= 2 || nickname.length >15 || !NICKNAME_REGEXP.test(nickname)){
		//不符合呢称规定.
		error_msg = "呢称不合法";
	}else if(email.length <=4 || email.length > 30 || !EMAIL_REGEXP.test(email)){
		error_msg = "邮箱地址不合法";
	}
	if(error_msg){
		this.status = 422;
		return this.body = {error_msg:error_msg};
	}
	try{
		let newUser = new User(this.request.body);
		newUser.role = 'user';
		const user = yield newUser.save();
		yield Logs.create({
			uid: this.req.user._id,
			content:"创建新用户 "+ (user.email || user.nickname),
			type:"user"
		});
		this.status = 200;
		this.body = {success:true,user_id:user._id};
	}catch(err){
		if(err.errors.nickname){
			this.status = 500;
			return this.body = {error_msg:err.errors.nickname.message};
		}
		this.throw(err);
	}
}

//删除用户
exports.destroy = function *() {
	const userId = this.req.user._id;

	if(String(userId) === String(this.params.id)){
		this.status = 403;
		return this.body = {message:"不能删除自己已经登录的账号"};
	}else{
		try{
			const user = yield User.findByIdAndRemove(this.params.id);
			yield Logs.create({
				uid:userId,
				content:"删除用户"+ (user.email || user.nickname),
				type:"user"
			});
			this.status = 200;
			this.body = {success:true};
		}catch(err){
			this.throw(err);
		}
	}
}

//更新用户
exports.updateUser = function *() {
	//被编辑人
	const editUserId = this.params.id;
	const nickname = this.request.body.nickname?this.request.body.nickname.replace(/(^\s+)|(\s+$)/g, ""):'';
	const email = this.request.body.email?this.request.body.email.replace(/(^\s+)|(\s+$)/g, ""):'';
	const NICKNAME_REGEXP = /^[(\u4e00-\u9fa5)0-9a-zA-Z\_\s@]+$/;
  const EMAIL_REGEXP = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
	let error_msg;
	if(nickname === ''){
		error_msg = "呢称不能为空";
	}else if(email === ''){
		error_msg = "邮箱地址不能为空";
	}else if(nickname.length <= 2 || nickname.length >15 || !NICKNAME_REGEXP.test(nickname)){
		//不符合呢称规定.
		error_msg = "呢称不合法";
	}else if(email.length <=4 || email.length > 30 || !EMAIL_REGEXP.test(email)){
		error_msg = "邮箱地址不合法";
	}
	if(error_msg){
		this.status = 422;
		return this.body = {error_msg:error_msg};
	}
	try{	
		let user = yield User.findById(editUserId);
		user.nickname = this.request.body.nickname;
		user.email = this.request.body.email.toLowerCase();
		if(this.request.body.status){
			user.status = this.request.body.status;
		}
		if(this.request.body.newPassword){
			user.password = this.request.body.newPassword;
		}
		const newUser = yield user.save();
		yield Logs.create({
			email:this.req.user._id,
			content:"编辑用户"+ (newUser.email || newUser.nickname),
			type:"user"
		});
		this.status = 200;
		this.body = {success:true,user_id:newUser._id};
	}catch(err){
		if(err.errors.nickname){
			this.status = 500;
			return this.body = {error_msg:err.errors.nickname.message};
		}
		this.throw(err);
	}
}

//前台用户更新自己信息
exports.mdUser = function *() {
	const nickname = this.request.body.nickname?this.request.body.nickname.replace(/(^\s+)|(\s+$)/g, ""):'';
	const NICKNAME_REGEXP = /^[(\u4e00-\u9fa5)0-9a-zA-Z\_\s@]+$/;
  //var EMAIL_REGEXP = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
	//检测一下
	let error_msg;
	if(nickname === ''){
		error_msg = '呢称不能为空';
	}else if(nickname.length <= 2 || nickname.length >15 || !NICKNAME_REGEXP.test(nickname)){
		//不符合呢称规定.
		error_msg = '呢称不合法';
	}
	if(error_msg){
		this.status = 422;
		return this.body = {error_msg:error_msg};
	}
	let user = this.req.user;
	user.nickname = nickname;
	try{
		const result = yield user.save();
		this.status = 200;
		this.body = {success:true,data:result.userInfo};
	}catch(err){
		this.throw(err)
	}
}
//前台获取用户社交账号绑定情况.
exports.getUserProvider = function *() {
	try{
		const user = yield User.findById(this.req.user._id);
		this.status = 200;
		this.body = {data:user.providerInfo};
	}catch(err){
		this.throw(err);
	}
}
//获取第三方登录列表.
exports.getSnsLogins = function *() {
	if(config.snsLogins){
		this.status = 200;
		this.body = {success:true,data:config.snsLogins};
	}else{
		this.throw(404);
	}
}