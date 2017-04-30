'use strict'

const router = require('koa-router')()
const passport = require('koa-passport')
const config = require('../config/env')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const auth = require('./auth.service')

// Passport Configuration
require('./local/passport').setup(User, config)
require('./github/passport').setup(User, config)
require('./weibo/passport').setup(User, config)
require('./qq/passport').setup(User, config)

router.use('/local',require('./local').routes())
router.use('/github',require('./github').routes())
router.use('/qq',require('./qq').routes())
router.use('/weibo',require('./weibo').routes())

module.exports = router