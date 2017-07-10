'use strict'

const _ = require('lodash')
const xss = require('xss')
const mongoose = require('mongoose')
const Comment = mongoose.model('Comment')
const Blog = mongoose.model('Article')

//添加新的评论.
exports.addNewComment = async (ctx,next) => {
	const aid = ctx.request.body.aid
	let content = ctx.request.body.content
	const userId = ctx.req.user._id
	let error_msg
	if(!aid){
		error_msg = '缺少必须参数'
	}else if(!content || content == ''){
		error_msg = '评论内容不能为空'
	}
	if(error_msg){
		ctx.status = 422
		return ctx.body = {error_msg:error_msg}
	}
	content = xss(content)

	try{
		let result = await Comment.create({ aid:aid,content:content,user_id:userId })
		let comment = result.toObject()
		comment.user_id = {
			_id:ctx.req.user._id,
			nickname:ctx.req.user.nickname,
			avatar:ctx.req.user.avatar
		}
		await Blog.findByIdAndUpdate(aid,{$inc:{comment_count:1}}).exec()
		ctx.status = 200
		ctx.body = {success:true,data:comment}
	}catch(err){
		ctx.throw(err)
	}
}

//获取评论列表.
exports.getFrontCommentList = async (ctx,next)=>{
	const aid = ctx.params.id
	try{
		const commentList = await Comment.find({aid:aid,status:{$eq:1}})
			.sort('created')
			.populate({
				path: 'user_id',
				select: 'nickname avatar',
				match: { nickname: { $exists: true } },
			})
			.exec()
		ctx.status = 200
		ctx.body = {data:commentList}
	}catch(err){
		ctx.throw(err)
	}
}
//添加回复
exports.addNewReply = async (ctx,next)=>{
	const cid = ctx.params.id
	if(!ctx.request.body.content || ctx.request.body.content == ''){
		ctx.status = 422
		return ctx.body = {error_msg:'回复内容不能为空'}
	}
	ctx.request.body.content = xss(ctx.request.body.content)
	let reply = ctx.request.body
  reply.user_info = {
  	id:ctx.req.user._id,
  	nickname:ctx.req.user.nickname
  }
  reply.created = new Date()
  try{
  	const result = await Comment.findByIdAndUpdate(cid,{'$push':{'replys':reply}},{new:true})
		ctx.status = 200
		ctx.body = {success:true,data:result.replys}  	
  }catch(err){
  	ctx.throw(err)
  }
}
//删除评论.
exports.delComment = async (ctx,next)=>{
	const cid = ctx.params.id
	try{
		const result = await Comment.findByIdAndRemove(cid)
		//评论数-1  
		Blog.findByIdAndUpdate(result.aid,{$inc:{comment_count:-1}}).exec()
		ctx.status = 200
		ctx.body = {success:true}
	}catch(err){
		ctx.throw(err)
	}
}
//删除回复
exports.delReply = async (ctx,next)=>{
	const cid = ctx.params.id
	const rid = ctx.request.body.rid
	if(!rid){
		ctx.status = 422
		return ctx.body = {error_msg:'缺少回复ID.'}
	}
	try{
		const result = await Comment.findByIdAndUpdate(cid,{$pull:{replys:{ _id:mongoose.Types.ObjectId(rid) }}},{new:true})
		ctx.status = 200
		ctx.body = {success:true,data:result}
	}catch(err){
		ctx.throw(err)
	}
}