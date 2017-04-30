/**
 * 标签分类表,管理标签
 */
'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

let TagCategorySchema = new Schema({
	name:{
		type:String,
		unique: true
	},	//分类名称
	desc:String		//分类描述
})

exports.TagCategorySchema = TagCategorySchema
module.exports = mongoose.model('TagCategory',TagCategorySchema)