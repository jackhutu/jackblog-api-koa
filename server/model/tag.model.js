/**
 * 标签表
 */

'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

let TagSchema = new Schema({
	name:{						//标签名称
		type:String,
		unique: true
	},	
	cid:{
		type:Schema.Types.ObjectId,
		ref:'TagCategory'
	},
	is_index:{
		type:Boolean,
		default:false
	},
	is_show: {
		type:Boolean,
		default:false
	},
	sort:{
		type:Number,
		default:1
	}
})

exports.TagSchema = TagSchema
module.exports = mongoose.model('Tag',TagSchema)