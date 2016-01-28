'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');
const Comment = mongoose.model('Comment');
const Blog = mongoose.model('Article');

//添加新的评论.
exports.addNewComment = function *() {
	const aid = this.request.body.aid;
	const content = this.request.body.content;
	const userId = this.req.user._id;
	let error_msg;
	if(!aid){
		error_msg = '缺少必须参数';
	}else if(!content || content == ''){
		error_msg = "评论内容不能为空";
	}
	if(error_msg){
		this.status = 422;
		return this.body = {error_msg:error_msg};
	}
	try{
		let result = yield Comment.create({ aid:aid,content:content,user_id:userId });
		let comment = result.toObject();
		comment.user_id = {
			_id:this.req.user._id,
			nickname:this.req.user.nickname,
			avatar:this.req.user.avatar
		}
		yield Blog.findByIdAndUpdate(aid,{$inc:{comment_count:1}}).exec();
		this.status = 200;
		this.body = {success:true,data:comment};
	}catch(err){
		this.throw(err);
	}
}

//获取评论列表.
exports.getFrontCommentList = function *() {
	const aid = this.params.id;
	try{
		const commentList = yield Comment.find({aid:aid,status:{$eq:1}})
																.sort('created')
																.populate({
																	path: 'user_id',
																	select: 'nickname avatar'
																})
																.exec();

		this.status = 200;
		this.body = {data:commentList};
	}catch(err){
		this.throw(err);
	}
}
//添加回复
exports.addNewReply = function *() {
	const cid = this.params.id;
	if(!this.request.body.content || this.request.body.content == ''){
		this.status = 422;
		return this.body = {error_msg:"回复内容不能为空"};
	}
	let reply = this.request.body;
  reply.user_info = {
  	id:this.req.user._id,
  	nickname:this.req.user.nickname
  }
  reply.created = new Date();
  try{
  	const result = yield Comment.findByIdAndUpdate(cid,{"$push":{"replys":reply}},{new:true});
		this.status = 200;
		this.body = {success:true,data:result.replys};  	
  }catch(err){
  	this.throw(err);
  }
}
//删除评论.
exports.delComment = function *() {
	const cid = this.params.id;
	try{
		const result = yield Comment.findByIdAndRemove(cid);
		//评论数-1  
		Blog.findByIdAndUpdate(result.aid,{$inc:{comment_count:-1}}).exec();
		this.status = 200;
		this.body = {success:true};
	}catch(err){
		this.throw(err);
	}
}
//删除回复
exports.delReply = function *() {
	const cid = this.params.id;
	const rid = this.request.body.rid;
	if(!rid){
		this.status = 422;
		return this.body = {error_msg:"缺少回复ID."};
	}
	try{
		const result = yield Comment.findByIdAndUpdate(cid,{$pull:{replys:{ _id:mongoose.Types.ObjectId(rid) }}},{new:true});
		this.status = 200;
		this.body = {success:true,data:result};
	}catch(err){
		this.throw(err);
	}
}