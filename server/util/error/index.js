'use strict';

const _ = require('lodash');

function errorHandleMiddle() {
	return function *(next) {
	  try {
	    yield next;
	  } catch (err) {
	    this.status = err.status || 500;
	    let error_msg = err.message;
	    if(err.errors && typeof(err.errors) === 'object'){
	    	_.mapValues(err.errors, (item)=>{
	    		if(item.message){
	    			error_msg = item.message
	    		}
	    	});
	    }
	    this.body = {error_msg: error_msg};
	    this.app.emit('error', err, this);
	  }
	}
}

module.exports = errorHandleMiddle;