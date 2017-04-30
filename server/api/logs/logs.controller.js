'use strict'

const mongoose = require('mongoose')
const Logs = mongoose.model('Logs')

exports.getLogsList = async (ctx, next)=>{
	let currentPage = (parseInt(ctx.query.currentPage) > 0)?parseInt(ctx.query.currentPage):1
	let itemsPerPage = (parseInt(ctx.query.itemsPerPage) > 0)?parseInt(ctx.query.itemsPerPage):10
	let startRow = (currentPage - 1) * itemsPerPage

	let sortName = String(ctx.query.sortName) || 'created'
	let sortOrder = ctx.query.sortOrder
	if(sortOrder === 'false'){
		sortName = '-' + sortName
	}
	const logsList = await Logs.find({}).skip(startRow).limit(itemsPerPage).sort(sortName).exec()
	const count = await Logs.count()
	ctx.status = 200
	ctx.body = { data: logsList,count:count }
}
