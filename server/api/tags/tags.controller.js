'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const TagCategory = mongoose.model('TagCategory')
const Tag = mongoose.model('Tag')

//添加添签分类.
exports.addTagCat = async (ctx, next)=>{
	const catName = ctx.request.body.name
	if(!catName){
		ctx.status = 422
		return ctx.body = {error_msg:'标签分类名称不能为空.'}
	}
	try{
		const cat = await TagCategory.findOne({name:catName})
		if(cat){
			ctx.status = 403
			return ctx.body = {error_msg:'分类名称已经存在.'}
		}
		const result = await TagCategory.create(ctx.request.body)
		ctx.status = 200
		ctx.body = {success:true,cat_id:result._id}
	}catch(err){
		ctx.throw(err)
	}
}

//获取分类列表
exports.getTagCatList = async (ctx, next)=>{
	try{
		const result = await TagCategory.find()
		ctx.status = 200
		ctx.body = {success:true,data:result}
	}catch(err){
		ctx.throw(err)
	}
}

//更新分类
exports.updateTagCat = async (ctx, next)=>{
	const id = ctx.params.id
	if(ctx.request.body._id){
	  delete ctx.request.body._id
	}
	try{
		const result = await TagCategory.findByIdAndUpdate(id,ctx.request.body,{new:true})
		ctx.status = 200
		ctx.body = {success:true,cat_id:result._id}
	}catch(err){
		ctx.throw(err)
	}
}
//删除分类
//(如果分类下有标签,则不可删除)
exports.delTagCat = async (ctx, next)=>{
	const id = ctx.params.id
	try{
		const tag = await Tag.findOne({cid:id})
		if(tag){
			ctx.status = 403
			ctx.body = {error_msg:'此分类下有标签不可删除.'}
		}else{
			await TagCategory.findByIdAndRemove(id)
			ctx.status = 200
			ctx.body = {success:true}
		}
	}catch(err){
		ctx.throw(err)
	}
}

//获取标签列表
exports.getTagList = async (ctx, next)=>{
	const cid = ctx.params.id
  let condition = {}
  if(cid != 0){
  	condition = {cid:cid}
  }
  try{
  	const tagList = await Tag.find(condition)
											  	.sort('sort')
											  	.populate('cid')
											  	.exec()
		ctx.status = 200
		ctx.body = {success:true,data:tagList}
  }catch(err){
  	ctx.throw(err)
  }
}
//添加标签
exports.addTag = async (ctx, next)=>{
	//标签名称不能重复,标签分类名称必须有.
	const cid = ctx.request.body.cid
	const tagName = ctx.request.body.name
	let error_msg
	if(!tagName){
		error_msg = '标签名称不能为空.'
	}else if(!cid){
		error_msg = '必须选择一个标签分类.'
	}

	if(error_msg){
		ctx.status = 422
		return ctx.body = {error_msg:error_msg}
	}
	try{
		const tag = await Tag.findOne({name:tagName})
		if(tag){
			ctx.status = 403
			return ctx.body = {error_msg:'标签名称已经存在.'}
		}else{
			const result = await Tag.create(ctx.request.body)
			ctx.status = 200
			ctx.body = {success:true,tag_id:result._id}
		}
	}catch(err){
		ctx.throw(err)
	}
}

//删除标签
exports.deleteTag = async (ctx, next)=>{
	const id = ctx.params.id
	try{
		await Tag.findByIdAndRemove(id)
		ctx.status = 200
		ctx.body = {success:true}
	}catch(err){
		ctx.throw(err)
	}
}
//更新标签
exports.updateTag = async (ctx, next)=>{
	const id = ctx.params.id
	if(ctx.request.body._id){
	  delete ctx.request.body._id
	}
	try{
		const result = await Tag.findByIdAndUpdate(id,ctx.request.body,{new:true})
		ctx.status = 200
		ctx.body = {success:true,tag_id:result._id}
	}catch(err){
		ctx.throw(err)
	}
}
//前台数据
exports.getFrontTagList = async (ctx, next)=>{
	try{
		const result = await Tag.find({is_show:true},{},{sort:{'sort':-1}})
		ctx.status = 200
		ctx.body = {data:result}
	}catch(err){
		ctx.throw(err)
	}
}