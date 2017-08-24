const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')
const config = require('./config/env')

// 连接数据库.
mongoose.connect(config.mongo.uri, config.mongo.options)
const modelsPath = path.join(__dirname, 'model')
fs.readdirSync(modelsPath).forEach(function (file) {
	if (/(.*)\.(js$|coffee$)/.test(file)) {
		require(modelsPath + '/' + file)
	}
})
//mongoose promise 风格 [mongoose.Promise = require('bluebird')]
mongoose.Promise = global.Promise

module.exports = mongoose