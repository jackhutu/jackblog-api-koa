'use strict';

const path = require('path');
const bunyan = require('bunyan');
const config = require('../../config/env');

const logger = bunyan.createLogger({
	name: 'jackblog',
	serializers: {
	 req: bunyan.stdSerializers.req,
	 res: bunyan.stdSerializers.res,
	 err: bunyan.stdSerializers.err
	},
	streams: [
		{
			level: 'info',
			stream: process.stdout
		},{
			level: 'trace',
			stream: process.stdout
		},
		{
			level: 'debug',
			stream: process.stderr
		}
		,{
			type: 'rotating-file',
			level: 'error',
			path: path.join(config.root,'logs/' + config.env + '-' +'error.log'),
			period: '1d',   // daily rotation
			count: 7        // keep 7 back copies
		}
	]
});

function createLoggerMiddle() {
  return function *(next) {
    this.logger = logger;
    yield next; // jshint ignore:line
  };
};

module.exports = createLoggerMiddle;
module.exports.logger = logger;
