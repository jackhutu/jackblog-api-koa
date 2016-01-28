'use strict';

const mongoose = require('mongoose');
const Logs = mongoose.model('Logs');

exports.getLogsList = function *(next){

	let currentPage = (parseInt(this.query.currentPage) > 0)?parseInt(this.query.currentPage):1;
	let itemsPerPage = (parseInt(this.query.itemsPerPage) > 0)?parseInt(this.query.itemsPerPage):10;
	let startRow = (currentPage - 1) * itemsPerPage;

	let sortName = String(this.query.sortName) || "created";
	let sortOrder = this.query.sortOrder;
	if(sortOrder === 'false'){
		sortName = "-" + sortName;
	}
	const logsList = yield Logs.find({}).skip(startRow).limit(itemsPerPage).sort(sortName).exec();
	const count = yield Logs.count();
	this.status = 200;
	this.body = { data: logsList,count:count };
};
