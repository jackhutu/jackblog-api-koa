'use strict'

const config = require('../../config/env')

exports.getApps = async (ctx)=>{
	if(config.apps){
		ctx.status = 200
		ctx.body = {success:true,data:config.apps}
	}else{
		ctx.throw(404)
	}
}
