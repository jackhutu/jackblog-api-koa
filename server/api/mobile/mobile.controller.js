'use strict'

const config = require('../../config/env')

exports.getApps = function *(next){
	if(config.apps){
		this.status = 200
		this.body = {success:true,data:config.apps}
	}else{
		this.throw(404)
	}
}
