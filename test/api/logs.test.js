"use strict";

const app = require('../../server/app');
const request = require('supertest')(app.listen());
const should = require("should"); 
const mongoose = require('mongoose');
const	User = mongoose.model('User');
const	Logs = mongoose.model('Logs');
const co = require("co");
const authHelper = require('../middlewares/authHelper');

describe('test/api/logs.test.js',function () {
	//测试需要一篇文章,和这篇文章的评论.
	let token, mockLogId,mockUserId;
	before(co.wrap(function *() {
	  const user = yield authHelper.createUser('admin');
	  mockUserId = user._id;
	  const log = Logs.create({
									content:'删除用户.',
									uid:mockUserId,
									type:'user'
								},{
									content:'删除文章.',
									uid:mockUserId,
									type:'article'
								});
	  mockLogId = log._id;
	  token = yield authHelper.getToken(request,user.email);
	}));

	after(co.wrap(function *() {
		yield User.findByIdAndRemove(mockUserId).exec();
		yield Logs.remove().exec();
	}));

	describe('get /logs/getLogsList',function () {
		it('should return logs list',function (done) {
			request.get('/logs/getLogsList')
			.set('Authorization','Bearer ' + token)
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function (err,res) {
				if(err) return done(err);
				res.body.data.length.should.be.above(0);
				res.body.count.should.be.above(0);
				done();
			});

		});
		it('should when sort desc return logs list',function (done) {
			request.get('/logs/getLogsList')
			.query({
				itemsPerPage:1,
				currentPage:2,
				sortOrder:'false',
				sortName:''
			})
			.set('Authorization','Bearer ' + token)
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function (err,res) {
				if(err) return done(err);
				res.body.data.length.should.be.above(0);
				res.body.count.should.be.above(0);
				done();
			});
		});

	});

});