'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');
const TagCategory = mongoose.model('TagCategory');
const Tag = mongoose.model('Tag');

//添加添签分类.
exports.addTagCat = function *() {
	const catName = this.request.body.name;
	if(!catName){
		this.status = 422;
		return this.body = {error_msg:"标签分类名称不能为空."};
	}
	try{
		const cat = yield TagCategory.findOne({name:catName});
		if(cat){
			this.status = 403;
			return this.body = {error_msg:"分类名称已经存在."};
		}
		const result = yield TagCategory.create(this.request.body);
		this.status = 200;
		this.body = {success:true,cat_id:result._id};
	}catch(err){
		this.throw(err);
	}
}

//获取分类列表
exports.getTagCatList = function *() {
	try{
		const result = yield TagCategory.find();
		this.status = 200;
		this.body = {success:true,data:result};
	}catch(err){
		this.throw(err);
	}
}

//更新分类
exports.updateTagCat = function *() {
	const id = this.params.id;
	if(this.request.body._id){
	  delete this.request.body._id;
	}
	try{
		const result = yield TagCategory.findByIdAndUpdate(id,this.request.body,{new:true});
		this.status = 200;
		this.body = {success:true,cat_id:result._id};
	}catch(err){
		this.throw(err);
	}
}
//删除分类
//(如果分类下有标签,则不可删除)
exports.delTagCat = function *() {
	const id = this.params.id;
	try{
		const tag = yield Tag.findOne({cid:id});
		if(tag){
			this.status = 403;
			this.body = {error_msg:"此分类下有标签不可删除."};
		}else{
			yield TagCategory.findByIdAndRemove(id);
			this.status = 200;
			this.body = {success:true};
		}
	}catch(err){
		this.throw(err);
	}
}

//获取标签列表
exports.getTagList = function *() {
	const cid = this.params.id;
  let condition = {};
  if(cid != 0){
  	condition = {cid:cid};
  }
  try{
  	const tagList = yield Tag.find(condition)
											  	.sort('sort')
											  	.populate('cid')
											  	.exec();
		this.status = 200;
		this.body = {success:true,data:tagList};
  }catch(err){
  	this.throw(err);
  }
}
//添加标签
exports.addTag = function *() {
	//标签名称不能重复,标签分类名称必须有.
	const cid = this.request.body.cid;
	const tagName = this.request.body.name;
	let error_msg;
	if(!tagName){
		error_msg = '标签名称不能为空.';
	}else if(!cid){
		error_msg = '必须选择一个标签分类.';
	}

	if(error_msg){
		this.status = 422;
		return this.body = {error_msg:error_msg};
	}
	try{
		const tag = yield Tag.findOne({name:tagName});
		if(tag){
			this.status = 403;
			return this.body = {error_msg:'标签名称已经存在.'};
		}else{
			const result = yield Tag.create(this.request.body);
			this.status = 200;
			this.body = {success:true,tag_id:result._id};
		}
	}catch(err){
		this.throw(err);
	}
}

//删除标签
exports.deleteTag = function *() {
	const id = this.params.id;
	try{
		yield Tag.findByIdAndRemove(id);
		this.status = 200;
		this.body = {success:true};
	}catch(err){
		this.throw(err);
	}
}
//更新标签
exports.updateTag = function *() {
	const id = this.params.id;
	if(this.request.body._id){
	  delete this.request.body._id;
	}
	try{
		const result = yield Tag.findByIdAndUpdate(id,this.request.body,{new:true});
		this.status = 200;
		this.body = {success:true,tag_id:result._id};
	}catch(err){
		this.throw(err);
	}
}
//前台数据
exports.getFrontTagList = function *(next) {
	try{
		const result = yield Tag.find({is_show:true},{},{sort:{'sort':-1}});
		this.status = 200;
		this.body = {data:result};
	}catch(err){
		this.throw(err);
	}
}