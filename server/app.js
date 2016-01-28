'use strict';

// 设置默认环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const path = require('path');
const fs = require('fs');
const app = require('koa')();
const mongoose = require('mongoose');
const config = require('./config/env');
const onerror = require('koa-onerror'); 
const loggerMiddle = require('./util/logs');
// 连接数据库.
mongoose.connect(config.mongo.uri, config.mongo.options);
const modelsPath = path.join(__dirname, 'model');
fs.readdirSync(modelsPath).forEach(function (file) {
	if (/(.*)\.(js$|coffee$)/.test(file)) {
		require(modelsPath + '/' + file);
	}
});

// 初始化数据
if(config.seedDB && config.env === 'development') { 
	const initData = require('./config/seed'); 
	app.use(initData());
}

//log记录
//router use : this.logger.error('msg')
app.use(loggerMiddle());
onerror(app);
require('./config/koa')(app);
require('./routes')(app);
// app.on('error', function(err, ctx){
//   console.error('server error', err);
// });
// Start server
app.listen(config.port, function () {
  console.log('Koa server listening on %d, in %s mode', config.port, app.env);
});

module.exports = app;