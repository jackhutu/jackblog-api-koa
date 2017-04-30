'use strict'

const router = require('koa-router')()
const controller = require('./article.controller')
const auth = require('../../auth/auth.service')
const multer = require('koa-multer')
const upload = multer({ dest: './uploads/' })

//后台管理
router.post('/addArticle',auth.hasRole('admin'),controller.addArticle)
router.get('/getArticleList',auth.hasRole('admin'),controller.getArticleList)
router.put('/:id/updateArticle', auth.hasRole('admin'), controller.updateArticle)
router.delete('/:id', auth.hasRole('admin'), controller.destroy)
router.get('/:id/getArticle', auth.hasRole('admin'), controller.getArticle)
router.post('/uploadImage', auth.hasRole('admin'), upload.single('file'), controller.uploadImage)
router.post('/fetchImage', auth.hasRole('admin'), controller.fetchImage)

//前台获取
router.get('/getFrontArticleList',controller.getFrontArticleList)
router.get('/getFrontArticleCount',controller.getFrontArticleCount)
router.get('/:id/getFrontArticle',controller.getFrontArticle)
//获取首页图片
router.get('/getIndexImage',controller.getIndexImage)
//用户喜欢文章
router.put('/:id/toggleLike',auth.isAuthenticated(),controller.toggleLike)
//获取上一篇和下一篇
router.get('/:id/getPrenext',controller.getPrenext)
module.exports = router