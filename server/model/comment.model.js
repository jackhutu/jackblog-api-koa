/**
 * 评论表
 */
'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

let CommentSchema = new Schema({
	aid:{
		type: Schema.Types.ObjectId,
		ref: 'Article'
	},
	user_id:{
		type: Schema.Types.ObjectId,
		ref:'User'
	},
	content:String,
	//针对评论的回复
	replys:[{
		content:String, //回复内容
		user_info:Object,
		created:Date
	}],
	status:{		//0,删除,1,正常
		type:Number,
		default:1
	},		
	created: {
		type: Date,
		default: Date.now
	},
  updated: {
    type: Date,
    default: Date.now
  }
})

exports.CommentSchema = CommentSchema
module.exports = mongoose.model('Comment',CommentSchema)