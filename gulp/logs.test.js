// "use strict";

// const app = require('../../server/app');
// const request = require('supertest')(app.listen());
// const should = require("should"); 
// const mongoose = require('mongoose');
// const	User = mongoose.model('User');
// const	Logs = mongoose.model('Logs');
// const co = require("co");
// const authHelper = require('../middlewares/authHelper');

// describe('test/api/logs.test.js',function () {
// 	//测试需要一篇文章,和这篇文章的评论.
// 	let token, mockLogId,mockUserId;
// 	before(async () => {
// 	  const user = await authHelper.createUser('admin');
// 	  mockUserId = user._id;
// 	  const log = await Logs.create({
// 									content:'删除用户.',
// 									uid:mockUserId,
// 									type:'user'
// 								},{
// 									content:'删除文章.',
// 									uid:mockUserId,
// 									type:'article'
// 								});
// 	  mockLogId = log._id;
// 	  token = await authHelper.getToken(request,user.email);
// 	});

// 	after(async () => {
// 		await User.findByIdAndRemove(mockUserId).exec();
// 		await Logs.remove().exec();
// 	});

// 	describe('get /logs/getLogsList',function () {
// 		it('should return logs list',async (done) => {
// 			const result = await request.get('/logs/getLogsList').set('Authorization','Bearer ' + token)
// 			result.expect(200)
// 			result.expect('Content-Type', /json/)
// 			// .end(function (err,res) {
// 			// 	if(err) return done(err);
// 			// 	res.body.data.length.should.be.above(0);
// 			// 	res.body.count.should.be.above(0);
// 			// 	done();
// 			// });
// 			done();
// 		});
// 		it('should when sort desc return logs list',async (done) => {
// 			const result = await request.get('/logs/getLogsList')
// 			.query({
// 				itemsPerPage:1,
// 				currentPage:2,
// 				sortOrder:'false',
// 				sortName:''
// 			})
// 			.set('Authorization','Bearer ' + token)
// 			result.expect(200)
// 			result.expect('Content-Type', /json/)
// 			done();
// 			// .end(function (err,res) {
// 			// 	if(err) return done(err);
// 			// 	res.body.data.length.should.be.above(0);
// 			// 	res.body.count.should.be.above(0);
// 			// 	done();
// 			// });
// 		});

// 	});

// });