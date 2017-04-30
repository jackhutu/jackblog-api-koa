'use strict'

const router = require('koa-router')()
const controller = require('./mobile.controller')

router.get('/getApps',controller.getApps)

module.exports = router