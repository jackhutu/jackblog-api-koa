'use strict'

const mongoose = require('mongoose')
const User = mongoose.model('User')
const Logs = mongoose.model('Logs')
const captcha = require('trek-captcha')
const config = require('../../config/env')
/**
 * 获取验证码
 */
exports.getCaptcha = async (ctx,next)=>{
	const { token, buffer } = await captcha({size:6})
	ctx.session.captcha = token
	ctx.status = 200
	ctx.body = buffer
}

exports.getMe = async (ctx,next)=>{
	const userId = ctx.req.user._id
	try{
		const user = await User.findById(userId)
		ctx.status = 200
		ctx.body = user.userInfo
	}catch(err){
		ctx.throw(err)
	}
}
//后台获取用户列表
exports.getUserList = async (ctx,next)=>{
	let currentPage = (parseInt(ctx.query.currentPage) > 0)?parseInt(ctx.query.currentPage):1
	let itemsPerPage = (parseInt(ctx.query.itemsPerPage) > 0)?parseInt(ctx.query.itemsPerPage):10
	let startRow = (currentPage - 1) * itemsPerPage

	let sortName = String(ctx.query.sortName) || 'created'
	let sortOrder = ctx.query.sortOrder
	if(sortOrder === 'false'){
		sortName = '-' + sortName
	}
	try{
		const count = await User.count()
		const userList = await User.find({}).skip(startRow).limit(itemsPerPage).sort(sortName).exec()
		ctx.status = 200
		ctx.body = { data: userList, count:count }
	}catch(err){
		ctx.throw(err)
	}
}

//添加用户
exports.addUser = async (ctx,next)=>{
	const nickname = ctx.request.body.nickname?ctx.request.body.nickname.replace(/(^\s+)|(\s+$)/g, ''):''
	const email = ctx.request.body.email?ctx.request.body.email.replace(/(^\s+)|(\s+$)/g, ''):''
	const NICKNAME_REGEXP = /^[(\u4e00-\u9fa5)0-9a-zA-Z\_\s@]+$/
  const EMAIL_REGEXP = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/
	let error_msg
	if(nickname === ''){
		error_msg = '呢称不能为空'
	}else if(email === ''){
		error_msg = '邮箱地址不能为空'
	}else if(nickname.length <= 2 || nickname.length >15 || !NICKNAME_REGEXP.test(nickname)){
		//不符合呢称规定.
		error_msg = '呢称不合法'
	}else if(email.length <=4 || email.length > 30 || !EMAIL_REGEXP.test(email)){
		error_msg = '邮箱地址不合法'
	}
	if(error_msg){
		ctx.status = 422
		return ctx.body = {error_msg:error_msg}
	}
	try{
		let newUser = new User(ctx.request.body)
		newUser.role = 'user'
		const user = await newUser.save()
		await Logs.create({
			uid: ctx.req.user._id,
			content:'创建新用户 '+ (user.email || user.nickname),
			type:'user'
		})
		ctx.status = 200
		ctx.body = {success:true,user_id:user._id}
	}catch(err){
		ctx.throw(err)
	}
}

//删除用户
exports.destroy = async (ctx,next)=>{
	const userId = ctx.req.user._id

	if(String(userId) === String(ctx.params.id)){
		ctx.status = 403
		return ctx.body = {message:'不能删除自己已经登录的账号'}
	}else{
		try{
			const user = await User.findByIdAndRemove(ctx.params.id)
			await Logs.create({
				uid:userId,
				content:'删除用户'+ (user.email || user.nickname),
				type:'user'
			})
			ctx.status = 200
			ctx.body = {success:true}
		}catch(err){
			ctx.throw(err)
		}
	}
}

//更新用户
exports.updateUser = async (ctx,next)=>{
	//被编辑人
	const editUserId = ctx.params.id
	const nickname = ctx.request.body.nickname?ctx.request.body.nickname.replace(/(^\s+)|(\s+$)/g, ''):''
	const email = ctx.request.body.email?ctx.request.body.email.replace(/(^\s+)|(\s+$)/g, ''):''
	const NICKNAME_REGEXP = /^[(\u4e00-\u9fa5)0-9a-zA-Z\_\s@]+$/
  const EMAIL_REGEXP = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/
	let error_msg
	if(nickname === ''){
		error_msg = '呢称不能为空'
	}else if(email === ''){
		error_msg = '邮箱地址不能为空'
	}else if(nickname.length <= 2 || nickname.length >15 || !NICKNAME_REGEXP.test(nickname)){
		//不符合呢称规定.
		error_msg = '呢称不合法'
	}else if(email.length <=4 || email.length > 30 || !EMAIL_REGEXP.test(email)){
		error_msg = '邮箱地址不合法'
	}
	if(error_msg){
		ctx.status = 422
		return ctx.body = {error_msg:error_msg}
	}
	try{	
		let user = await User.findById(editUserId)
		user.nickname = ctx.request.body.nickname
		user.email = ctx.request.body.email.toLowerCase()
		if(ctx.request.body.status){
			user.status = ctx.request.body.status
		}
		if(ctx.request.body.newPassword){
			user.password = ctx.request.body.newPassword
		}
		const newUser = await user.save()
		await Logs.create({
			email:ctx.req.user._id,
			content:'编辑用户'+ (newUser.email || newUser.nickname),
			type:'user'
		})
		ctx.status = 200
		ctx.body = {success:true,user_id:newUser._id}
	}catch(err){
		ctx.throw(err)
	}
}

//前台用户更新自己信息
exports.mdUser = async (ctx,next)=>{
	const nickname = ctx.request.body.nickname?ctx.request.body.nickname.replace(/(^\s+)|(\s+$)/g, ''):''
	const NICKNAME_REGEXP = /^[(\u4e00-\u9fa5)0-9a-zA-Z\_\s@]+$/
  //var EMAIL_REGEXP = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/
	//检测一下
	let error_msg
	if(nickname === ''){
		error_msg = '呢称不能为空'
	}else if(nickname.length <= 2 || nickname.length >15 || !NICKNAME_REGEXP.test(nickname)){
		//不符合呢称规定.
		error_msg = '呢称不合法'
	}
	if(error_msg){
		ctx.status = 422
		return ctx.body = {error_msg:error_msg}
	}
	let user = ctx.req.user
	user.nickname = nickname
	try{
		const result = await user.save()
		ctx.status = 200
		ctx.body = {success:true,data:result.userInfo}
	}catch(err){
		ctx.throw(err)
	}
}
//前台获取用户社交账号绑定情况.
exports.getUserProvider = async (ctx,next)=>{
	try{
		const user = await User.findById(ctx.req.user._id)
		ctx.status = 200
		ctx.body = {data:user.providerInfo}
	}catch(err){
		ctx.throw(err)
	}
}
//获取第三方登录列表.
exports.getSnsLogins = async (ctx,next)=>{
	if(config.snsLogins){
		ctx.status = 200
		ctx.body = {success:true,data:config.snsLogins}
	}else{
		ctx.throw(404)
	}
}