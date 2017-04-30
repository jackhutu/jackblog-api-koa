'use strict'

const router = require('koa-router')()
const controller = require('./comment.controller')
const auth = require('../../auth/auth.service')

//后台管理
router.delete('/:id',auth.hasRole('admin'),controller.delComment)
router.put('/:id/delReply', auth.hasRole('admin'), controller.delReply)
//前台获取
router.post('/addNewComment',auth.isAuthenticated(),controller.addNewComment)
router.get('/:id/getFrontCommentList',controller.getFrontCommentList)
router.post('/:id/addNewReply',auth.isAuthenticated(),controller.addNewReply)
module.exports = router