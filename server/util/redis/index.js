'use strict'

const _ = require('lodash')
const Redis = require('ioredis')
const config = require('../../config/env')
const logger = require('../logs').logger

const client = new Redis(config.redis)

client.on('error', function (err) {
   logger.error('redis error', err)
})

exports = module.exports = client