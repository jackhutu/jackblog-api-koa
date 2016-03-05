'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');
const Article = mongoose.model('Article');
const User = mongoose.model('User');
const Comment = mongoose.model('Comment');
const qiniuHelper = require('../../util/qiniu');
const path = require('path');
const URL = require('url');
const MarkdownIt = require('markdown-it');
const config = require('../../config/env');
const tools = require('../../util/tools');

//添加博客
exports.addArticle = function *() {
	const content = this.request.body.content;
	const title = this.request.body.title;
	let error_msg;
	if(!title){
		error_msg = '标题不能为空.';
	}else if(!content){
		error_msg = '内容不能为空.';
	}
	if(error_msg){
		this.status = 422;
		return this.body = {error_msg:error_msg};
	}
	//将图片提取存入images,缩略图调用
	this.request.body.images = tools.extractImage(content);
	try{
		const result = yield Article.create(this.request.body);
		this.status = 200;
		this.body = {success: true,article_id:result._id};
	}catch(err){
		this.throw(err);
	}
}
//后台获取博客列表
exports.getArticleList = function *() {
	let currentPage = (parseInt(this.query.currentPage) > 0)?parseInt(this.query.currentPage):1;
	let itemsPerPage = (parseInt(this.query.itemsPerPage) > 0)?parseInt(this.query.itemsPerPage):10;
	let startRow = (currentPage - 1) * itemsPerPage;

	let sortName = String(this.query.sortName) || "publish_time";
	let sortOrder = this.query.sortOrder;
	if(sortOrder === 'false'){
		sortName = "-" + sortName;
	}
	try{
		const ArticleList = yield Article.find()
														.skip(startRow)
														.limit(itemsPerPage)
														.sort(sortName)
														.exec();
		const count = yield Article.count();
		this.status = 200;
		this.body = { data: ArticleList, count:count };
	}catch(err){
		this.throw(err);
	}
}

//删除博客(连同这篇文章的评论一起删除.)
exports.destroy = function *() {
	const id = this.params.id;
	try{
		yield Article.findByIdAndRemove(id);
		yield Comment.remove({aid:id});
		this.status = 200;
		this.body = {success: true};
	}catch(err){
		this.throw(err);
	}
}
//更新博客
exports.updateArticle = function *() {
	const id = this.params.id;
	if(this.request.body._id){
	  delete this.request.body._id;
	}
	const content = this.request.body.content;
	const title = this.request.body.title;
	let error_msg;
	if(!title){
		error_msg = '标题不能为空.';
	}else if(!content){
		error_msg = '内容不能为空.';
	}
	if(error_msg){
		this.status = 422;
		return this.body = {error_msg:error_msg};
	}
	//将图片提取存入images,缩略图调用
	this.request.body.images = tools.extractImage(content);
	this.request.body.updated = new Date();
	if(this.request.body.isRePub){
		this.request.body.publish_time = new Date();
	}
	try{
		const article = yield Article.findByIdAndUpdate(id,this.request.body,{new:true});
		this.status = 200;
		this.body = {success:true,article_id:article._id};
	}catch(err){
		this.throw(err);
	}
}
//获取单篇博客
exports.getArticle = function *() {
	const id = this.params.id;
	try{
		const article = yield Article.findOne({_id:id}).populate('tags').exec();
		this.status = 200;
		this.body = {data:article};
	}catch(err){
		this.throw(err);
	}
}
//上传图片
/*
var form = {
  body: this.req.body,
  files: this.req.files
}
 */
exports.uploadImage = function *() {
	let file = this.req.files.file;
	if(!file){
		this.status = 422;
		return this.body = {error_msg:"缺少文件参数."};
	}
	const fileName =  new Date().getTime() + file.originalname;
	try{
		const result = yield qiniuHelper.upload(file.path,'blog/article/' + fileName);
		this.status = 200;
		this.body = {success:true,img_url:result.url};
	}catch(err){
		this.throw(err);
	}
}
//将网络图片抓取到七牛
/**
 * 七牛返回结果
 * $$hashKey: "object:88"
 * hash: "FmUJ7-RWKGMtsX8UTY-_oa5ahsFb"
 * key: "blog/article/1439948192797e48eb2b310f91bda45273dbbfc1a8e6e.png"
 * url: "http://upload.jackhu.top/blog/article/1439948192797e48eb2b310f91bda45273dbbfc1a8e6e.png"
 */
exports.fetchImage = function *() {
	if(!this.request.body.url){
		this.status = 422;
		return this.body = {error_msg:"url地址不能为空."};
	}
	let urlLink = URL.parse(this.request.body.url);
	let fileName;
	if(urlLink.pathname.indexOf('/') !== -1){
		let links = urlLink.pathname.split('/');
		fileName = links[links.length - 1];
	}else{
		fileName = urlLink.pathname;
	};
	fileName =  new Date().getTime() + fileName;
	try{
		const result = yield qiniuHelper.fetch(this.request.body.url,'blog/article/' + fileName)
		this.status = 200;
		this.body = {success:true,img_url:result.url};
	}catch(err){
		this.throw(err);
	}
}
//前台获取博客数量
exports.getFrontArticleCount = function *(next) {
	let condition = {status:{$gt:0}};
	if(this.query.tagId){
		//tagId = new mongoose.Types.ObjectId(tagId);
		const tagId = String(this.query.tagId);
		condition = _.defaults(condition,{ tags: { $elemMatch: { $eq:tagId } } });
	}
	try{
		const count = yield Article.count(condition);
		this.status = 200;
		this.body = {success:true,count:count};
	}catch(err){
		this.throw(err);
	}
}
//前台获取博客列表
exports.getFrontArticleList = function *(next) {
	let currentPage = (parseInt(this.query.currentPage) > 0)?parseInt(this.query.currentPage):1;
	let itemsPerPage = (parseInt(this.query.itemsPerPage) > 0)?parseInt(this.query.itemsPerPage):10;
	let startRow = (currentPage - 1) * itemsPerPage;
	let sort = String(this.query.sortName) || "publish_time";
	sort = "-" + sort;
	let condition = {status:{$gt:0}};
	if(this.query.tagId){
		//tagId = new mongoose.Types.ObjectId(tagId);
		const tagId = String(this.query.tagId);
		condition = _.defaults(condition,{ tags: { $elemMatch: { $eq:tagId } } });		
	}
	try{
		const list = yield Article.find(condition)
			.select('title images visit_count comment_count like_count publish_time')
			.skip(startRow)
			.limit(itemsPerPage)
			.sort(sort)
			.exec();
		this.status = 200;
		this.body = {data:list};
	}catch(err){
		this.throw(err);
	}
}

//前台获取文章
exports.getFrontArticle = function *(next) {
	const id = this.params.id;
	const md = new MarkdownIt({
		html:true //启用html标记转换
	});
	//每次获取之后,将阅读数加1
	try{
		let result = yield Article.findById(id,'-images');
		result.content = md.render(result.content);
		result.visit_count++;
		yield Article.findByIdAndUpdate(id,{$inc:{visit_count:1}});
		this.status = 200;
		this.body = {data:result.info}
	}catch(err){
		this.throw(err)
	}
}
//前台获取上一篇和下一篇
exports.getPrenext = function *(next) {
	const id = this.params.id;
	const sort = String(this.query.sortName) || "publish_time";
	let preCondition,nextCondition;
	preCondition = {status:{$gt:0}};
	nextCondition = {status:{$gt:0}};
	if(this.query.tagId){
		//tagId = new mongoose.Types.ObjectId(tagId);
		const tagId = String(this.query.tagId);
		preCondition =  _.defaults(preCondition,{ tags: { $elemMatch: { $eq:tagId } } });
		nextCondition =  _.defaults(nextCondition,{ tags: { $elemMatch: { $eq:tagId } } });
	}

	try{
		const article = yield Article.findById(id);
		//先获取文章,
		if(sort === 'visit_count'){
			preCondition = _.defaults(preCondition,{'_id':{$ne:id},'visit_count':{'$lte':article.visit_count}});
			nextCondition = _.defaults(nextCondition,{'_id':{$ne:id},'visit_count':{'$gte':article.visit_count}});
		}else{
			preCondition = _.defaults(preCondition,{'_id':{$ne:id},'publish_time':{'$lte':article.publish_time}});
			nextCondition = _.defaults(nextCondition,{'_id':{$ne:id},'publish_time':{'$gte':article.publish_time}});
		}
		const preResult = yield Article.find(preCondition).select('title').limit(1).sort('-' + sort);
		const nextResult = yield Article.find(nextCondition).select('title').limit(1).sort(sort);
		const prev = preResult[0] || {};
		const next = nextResult[0] || {};
		this.status = 200;
		this.body = {data:{'next':next,'prev':prev}};
	}catch(err){
		this.throw(err)
	}
}
//获取首页图片
exports.getIndexImage = function *() {
	//直接从七牛获取会很慢,改为从配置数组中获取.
	if(!config.indexImages || config.indexImages.length < 1){
		this.status = 200;
		this.body = {success:true,img:config.defaultIndexImage};
		try{
			const result = yield qiniuHelper.list('blog/index','',10)
			config.indexImages = result.items.map(function (item) {
				return config.qiniu.domain + item.key + '-600x1500q80';
			})
		}catch(err){
			config.indexImages = []
		}
		return;
	}else{
		const images = config.indexImages;
		const index = _.random(images.length - 1);
		this.status = 200;
		return this.body = {success:true,img:images[index]};
	}
}
//用户喜欢
exports.toggleLike = function *() {
	const _this = this;
	const aid = new mongoose.Types.ObjectId(_this.params.id);
  const userId = _this.req.user._id;
  //如果已经喜欢过了,则从喜欢列表里,去掉文章ID,并减少文章喜欢数.否则添加到喜欢列表,并增加文章喜欢数.	
  //var isLink = _.indexOf(req.user.likeList.toString(), req.params.id);
  const isLike = _.findIndex(_this.req.user.likeList, function(item) {
    return item.toString() == _this.params.id;
  });
  let conditionOne,conditionTwo,liked;
  if(isLike !== -1){
  	conditionOne = {'$pull':{'likeList':aid}};
  	conditionTwo = {'$inc':{'like_count':-1}};
  	liked = false;
  }else{
  	conditionOne = {'$addToSet':{'likeList':aid}};
  	conditionTwo = {'$inc':{'like_count':1}};
  	liked = true;
  }

  try{
  	const user = yield User.findByIdAndUpdate(userId,conditionOne);
  	const article = yield Article.findByIdAndUpdate(aid,conditionTwo,{new:true});
  	_this.status = 200;
  	_this.body = {success:true,'count':article.like_count,'isLike':liked};
  }catch(err){
  	_this.throw(err)
  }
}