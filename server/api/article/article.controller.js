'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const Article = mongoose.model('Article')
const User = mongoose.model('User')
const Comment = mongoose.model('Comment')
const qiniuHelper = require('../../util/qiniu')
const path = require('path')
const URL = require('url')
const MarkdownIt = require('markdown-it')
const config = require('../../config/env')
const tools = require('../../util/tools')
const redis = require('../../util/redis')

//添加博客
exports.addArticle = async (ctx,next) => {
	const content = ctx.request.body.content
	const title = ctx.request.body.title
	let error_msg
	if(!title){
		error_msg = '标题不能为空.'
	}else if(!content){
		error_msg = '内容不能为空.'
	}
	if(error_msg){
		ctx.status = 422
		return ctx.body = {error_msg:error_msg}
	}
	//将图片提取存入images,缩略图调用
	ctx.request.body.images = tools.extractImage(content)
	try{
		const result = await Article.create(ctx.request.body)
		ctx.status = 200
		ctx.body = {success: true,article_id:result._id}
	}catch(err){
		ctx.throw(err)
	}
}
//后台获取博客列表
exports.getArticleList = async (ctx,next)=>{
	let currentPage = (parseInt(ctx.query.currentPage) > 0)?parseInt(ctx.query.currentPage):1
	let itemsPerPage = (parseInt(ctx.query.itemsPerPage) > 0)?parseInt(ctx.query.itemsPerPage):10
	let startRow = (currentPage - 1) * itemsPerPage

	let sortName = String(ctx.query.sortName) || 'publish_time'
	let sortOrder = ctx.query.sortOrder
	if(sortOrder === 'false'){
		sortName = '-' + sortName
	}
	try{
		const ArticleList = await Article.find()
														.skip(startRow)
														.limit(itemsPerPage)
														.sort(sortName)
														.exec()
		const count = await Article.count()
		ctx.status = 200
		ctx.body = { data: ArticleList, count:count }
	}catch(err){
		ctx.throw(err)
	}
}

//删除博客(连同这篇文章的评论一起删除.)
exports.destroy = async (ctx,next)=>{
	const id = ctx.params.id
	try{
		await Article.findByIdAndRemove(id)
		await Comment.remove({aid:id})
		ctx.status = 200
		ctx.body = {success: true}
	}catch(err){
		ctx.throw(err)
	}
}
//更新博客
exports.updateArticle = async (ctx,next)=>{
	const id = ctx.params.id
	if(ctx.request.body._id){
	  delete ctx.request.body._id
	}
	const content = ctx.request.body.content
	const title = ctx.request.body.title
	let error_msg
	if(!title){
		error_msg = '标题不能为空.'
	}else if(!content){
		error_msg = '内容不能为空.'
	}
	if(error_msg){
		ctx.status = 422
		return ctx.body = {error_msg:error_msg}
	}
	//将图片提取存入images,缩略图调用
	ctx.request.body.images = tools.extractImage(content)
	ctx.request.body.updated = new Date()
	if(ctx.request.body.isRePub){
		ctx.request.body.publish_time = new Date()
	}
	try{
		const article = await Article.findByIdAndUpdate(id,ctx.request.body,{new:true})
		ctx.status = 200
		ctx.body = {success:true,article_id:article._id}
	}catch(err){
		ctx.throw(err)
	}
}
//获取单篇博客
exports.getArticle = async (ctx,next)=>{
	const id = ctx.params.id
	try{
		const article = await Article.findOne({_id:id}).populate('tags').exec()
		ctx.status = 200
		ctx.body = {data:article}
	}catch(err){
		ctx.throw(err)
	}
}
//上传图片
/*
var form = {
  body: ctx.req.body,
  files: ctx.req.files
}
 */
exports.uploadImage = async (ctx,next)=>{
	let file = ctx.req.file
	if(!file){
		ctx.status = 422
		return ctx.body = {error_msg:'缺少文件参数.'}
	}
	const fileName =  new Date().getTime() + file.originalname
	try{
		const result = await qiniuHelper.upload(file.path,'blog/article/' + fileName)
		ctx.status = 200
		ctx.body = {success:true,img_url:result.url}
	}catch(err){
		ctx.throw(err)
	}
}
//将网络图片抓取到七牛
/**
 * 七牛返回结果
 * $$hashKey: 'object:88'
 * hash: 'FmUJ7-RWKGMtsX8UTY-_oa5ahsFb'
 * key: 'blog/article/1439948192797e48eb2b310f91bda45273dbbfc1a8e6e.png'
 * url: 'http://upload.jackhu.top/blog/article/1439948192797e48eb2b310f91bda45273dbbfc1a8e6e.png'
 */
exports.fetchImage = async (ctx,next)=>{
	if(!ctx.request.body.url){
		ctx.status = 422
		return ctx.body = {error_msg:'url地址不能为空.'}
	}
	let urlLink = URL.parse(ctx.request.body.url)
	let fileName
	if(urlLink.pathname.indexOf('/') !== -1){
		let links = urlLink.pathname.split('/')
		fileName = links[links.length - 1]
	}else{
		fileName = urlLink.pathname
	}
	fileName =  new Date().getTime() + fileName
	try{
		const result = await qiniuHelper.fetch(ctx.request.body.url,'blog/article/' + fileName)
		ctx.status = 200
		ctx.body = {success:true,img_url:result.url}
	}catch(err){
		ctx.throw(err)
	}
}
//前台获取博客数量
exports.getFrontArticleCount = async (ctx,next)=>{
	let condition = {status:{$gt:0}}
	if(ctx.query.tagId){
		//tagId = new mongoose.Types.ObjectId(tagId)
		const tagId = String(ctx.query.tagId)
		condition = _.defaults(condition,{ tags: { $elemMatch: { $eq:tagId } } })
	}
	try{
		const count = await Article.count(condition)
		ctx.status = 200
		ctx.body = {success:true,count:count}
	}catch(err){
		ctx.throw(err)
	}
}
//前台获取博客列表
exports.getFrontArticleList = async (ctx,next)=>{
	let currentPage = (parseInt(ctx.query.currentPage) > 0)?parseInt(ctx.query.currentPage):1
	let itemsPerPage = (parseInt(ctx.query.itemsPerPage) > 0)?parseInt(ctx.query.itemsPerPage):10
	let startRow = (currentPage - 1) * itemsPerPage
	let sort = String(ctx.query.sortName) || 'publish_time'
	sort = '-' + sort
	let condition = {status:{$gt:0}}
	if(ctx.query.tagId){
		//tagId = new mongoose.Types.ObjectId(tagId)
		const tagId = String(ctx.query.tagId)
		condition = _.defaults(condition,{ tags: { $elemMatch: { $eq:tagId } } })		
	}
	try{
		const list = await Article.find(condition)
			.select('title images visit_count comment_count like_count publish_time')
			.skip(startRow)
			.limit(itemsPerPage)
			.sort(sort)
			.exec()
		ctx.status = 200
		ctx.body = {data:list}
	}catch(err){
		ctx.throw(err)
	}
}

//前台获取文章
exports.getFrontArticle = async (ctx,next)=>{
	const id = ctx.params.id
	const md = new MarkdownIt({
		html:true //启用html标记转换
	})
	//每次获取之后,将阅读数加1
	try{
		let result = await Article.findById(id,'-images')
		result.content = md.render(result.content)
		result.visit_count++
		await Article.findByIdAndUpdate(id,{$inc:{visit_count:1}})
		ctx.status = 200
		ctx.body = {data:result.info}
	}catch(err){
		ctx.throw(err)
	}
}
//前台获取上一篇和下一篇
exports.getPrenext = async (ctx,next)=>{
	const id = ctx.params.id
	const sort = String(ctx.query.sortName) || 'publish_time'
	let preCondition,nextCondition
	preCondition = {status:{$gt:0}}
	nextCondition = {status:{$gt:0}}
	if(ctx.query.tagId){
		//tagId = new mongoose.Types.ObjectId(tagId)
		const tagId = String(ctx.query.tagId)
		preCondition =  _.defaults(preCondition,{ tags: { $elemMatch: { $eq:tagId } } })
		nextCondition =  _.defaults(nextCondition,{ tags: { $elemMatch: { $eq:tagId } } })
	}

	try{
		const article = await Article.findById(id)
		//先获取文章,
		if(sort === 'visit_count'){
			preCondition = _.defaults(preCondition,{'_id':{$ne:id},'visit_count':{'$lte':article.visit_count}})
			nextCondition = _.defaults(nextCondition,{'_id':{$ne:id},'visit_count':{'$gte':article.visit_count}})
		}else{
			preCondition = _.defaults(preCondition,{'_id':{$ne:id},'publish_time':{'$lte':article.publish_time}})
			nextCondition = _.defaults(nextCondition,{'_id':{$ne:id},'publish_time':{'$gte':article.publish_time}})
		}
		const preResult = await Article.find(preCondition).select('title').limit(1).sort('-' + sort)
		const nextResult = await Article.find(nextCondition).select('title').limit(1).sort(sort)
		const prev = preResult[0] || {}
		const next = nextResult[0] || {}
		ctx.status = 200
		ctx.body = {data:{'next':next,'prev':prev}}
	}catch(err){
		ctx.throw(err)
	}
}
//获取首页图片
exports.getIndexImage = async (ctx,next)=>{
	//从redis中获取
	const imagesCount = await redis.llen('indexImages')
	if(!imagesCount || imagesCount < 1){
		ctx.status = 200
		ctx.body = {success:true,img:config.defaultIndexImage}
		try{
			if(config.qiniu.app_key !== '' && config.qiniu.app_secret !== ''){
				const result = await qiniuHelper.list({prefix:'blog/index', marker:'',limit:30})
				result.items.map(function (item) {
					redis.lpush('indexImages',config.qiniu.domain + item.key + '-600x1500q80')
				})
			}
		}catch(err){
			redis.del('indexImages')
		}
		return
	}else{
		const images = await redis.lrange('indexImages', 0, 30)
		const index = _.random(images.length - 1)
		ctx.status = 200
		return ctx.body = {success:true,img:images[index]}
	}
}
//用户喜欢
exports.toggleLike = async (ctx,next)=>{
	const _ctx = ctx
	const aid = new mongoose.Types.ObjectId(_ctx.params.id)
  const userId = _ctx.req.user._id
  //如果已经喜欢过了,则从喜欢列表里,去掉文章ID,并减少文章喜欢数.否则添加到喜欢列表,并增加文章喜欢数.	
  //var isLink = _.indexOf(req.user.likeList.toString(), req.params.id)
  const isLike = _.findIndex(_ctx.req.user.likeList, function(item) {
    return item.toString() == _ctx.params.id
  })
  let conditionOne,conditionTwo,liked
  if(isLike !== -1){
  	conditionOne = {'$pull':{'likeList':aid}}
  	conditionTwo = {'$inc':{'like_count':-1}}
  	liked = false
  }else{
  	conditionOne = {'$addToSet':{'likeList':aid}}
  	conditionTwo = {'$inc':{'like_count':1}}
  	liked = true
  }

  try{
  	const user = await User.findByIdAndUpdate(userId,conditionOne)
  	const article = await Article.findByIdAndUpdate(aid,conditionTwo,{new:true})
  	_ctx.status = 200
  	_ctx.body = {success:true,'count':article.like_count,'isLike':liked}
  }catch(err){
  	_ctx.throw(err)
  }
}