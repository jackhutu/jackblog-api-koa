"use strict";

const app = require('../../server/app');
const request = require('supertest')(app.listen());
const should = require("should"); 
const mongoose = require('mongoose');
const User = mongoose.model('User');
const TagCategory = mongoose.model('TagCategory');
const Tag = mongoose.model('Tag');
const Logs = mongoose.model('Logs');
const co = require("co");
const authHelper = require('../middlewares/authHelper');

describe('test/api/tags.test.js',function () {
	let token, mockUserId,mockTagCatId,mockTagId;
	before(co.wrap(function *() {
	  const user = yield authHelper.createUser('admin');
	  mockUserId = user._id;
	  token = yield authHelper.getToken(request,user.email);
	}));

	after(co.wrap(function *() {
		yield User.findByIdAndRemove(mockUserId);
		yield Tag.findByIdAndRemove(mockTagId);
		yield TagCategory.findByIdAndRemove(mockTagCatId);
		yield Logs.remove();
	}));

	describe('post /tags/addTagCat', function() {
		let catName = '标签分类名' + new Date().getTime();
		it('should when not name return error', function(done) {
			request.post('/tags/addTagCat')
			.set('Authorization','Bearer ' + token)
			.send({
				desc:'测试标签分类名'
			})
			.expect(422,done);
		});

		it('should return new tag category', function(done) {
			request.post('/tags/addTagCat')
			.set('Authorization','Bearer ' + token)
			.send({
				name: catName,
				desc:'测试标签分类名'
			})
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function (err,res) {
				if(err) return done(err);
				mockTagCatId = res.body.cat_id;
				res.body.cat_id.should.be.String();
				res.body.success.should.be.true();
				done();
			})
		});
		it('should when second add catName return error', function(done) {
			request.post('/tags/addTagCat')
			.set('Authorization','Bearer ' + token)
			.send({
				name: catName,
				desc:'测试标签分类名'
			})
			.expect(403,done);
		});
	});

	describe('post /tags/addTag', function() {
		let tagName = '标签名称' + new Date().getTime();
		it('should when not name return error', function(done) {
			request.post('/tags/addTag')
			.set('Authorization','Bearer ' + token)
			.send({
				cid:mockTagCatId,
				is_show:true
			})
			.expect(422,done);
		});

		it('should when not cid return error', function(done) {
			request.post('/tags/addTag')
			.set('Authorization','Bearer ' + token)
			.send({
				name:tagName,
				is_show:true
			})
			.expect(422,done);
		});

		it('should return new tag', function(done) {
			request.post('/tags/addTag')
			.set('Authorization','Bearer ' + token)
			.send({
				name:tagName,
				cid:mockTagCatId,
				is_show:true
			})
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function (err,res) {
				if(err) return done(err);
				mockTagId = res.body.tag_id;
				res.body.tag_id.should.be.String();
				res.body.success.should.be.true();
				done();
			})
		});
		it('should when second add tagName return error', function(done) {
			request.post('/tags/addTag')
			.set('Authorization','Bearer ' + token)
			.send({
				name:tagName,
				cid:mockTagCatId,
				is_show:true
			})
			.expect(403,done);
		});
	});

	describe('put /tags/:id/updateTagCat', function() {
		it('should return update tag category',function (done) {
			request.put('/tags/' + mockTagCatId + '/updateTagCat')
						.set('Authorization','Bearer ' + token)
						.send({
							_id:mockTagCatId,
							name:'新的标签分类名称' + new Date().getTime(),
							desc:'新的描述'
						})
						.expect(200)
						.expect('Content-Type', /json/)
						.end(function (err,res) {
							if(err) return done(err);
							res.body.cat_id.should.be.String();
							res.body.success.should.be.true();
							done();
						});
		})
	});

	describe('put /tags/:id/updateTag', function() {
		it('should return update tag',function (done) {
			request.put('/tags/' + mockTagId + '/updateTag')
						.set('Authorization','Bearer ' + token)
						.send({
							_id:mockTagId,
							name:'新的分类名称' + new Date().getTime()
						})
						.expect(200)
						.expect('Content-Type', /json/)
						.end(function (err,res) {
							if(err) return done(err);
							res.body.tag_id.should.be.String();
							res.body.success.should.be.true();
							done();
						});
		})
	});

	describe('get /tags/getTagCatList',function () {
		it('should return tag category list',function (done) {
			request.get('/tags/getTagCatList')
			.set('Authorization','Bearer ' + token)
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function (err,res) {
				if(err) return done(err);
				res.body.data.length.should.be.above(0);
				done();
			});

		});
	});

	describe('get /tags/:id/getTagList',function () {
		it('should return tag list in category',function (done) {
			request.get('/tags/' + mockTagCatId + '/getTagList')
			.set('Authorization','Bearer ' + token)
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function (err,res) {
				if(err) return done(err);
				res.body.data.length.should.be.above(0);
				done();
			});

		});

		it('should return all tag list',function (done) {
			request.get('/tags/0/getTagList')
			.set('Authorization','Bearer ' + token)
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function (err,res) {
				if(err) return done(err);
				res.body.data.length.should.be.above(0);
				done();
			});

		});
	});

	describe('get /tags/getFrontTagList',function () {
		it('should return tag list to frontend',function (done) {
			request.get('/tags/getFrontTagList')
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function (err,res) {
				if(err) return done(err);
				res.body.data.length.should.be.above(0);
				done();
			});
		});

	});

	describe('delete /tags/:id',function () {
		it('should return error',function (done) {
			request.del('/tags/' + mockTagCatId)
			.set('Authorization','Bearer ' + token)
			.expect(403,done);
		});
	});

	describe('delete /tags/:id/deleteTag',function () {
		it('should return error',function (done) {
			request.del('/tags/dddddd/deleteTag')
			.set('Authorization','Bearer ' + token)
			.expect(500,done);
		});

		it('should return success',function (done) {
			request.del('/tags/' + mockTagId + '/deleteTag')
			.set('Authorization','Bearer ' + token)
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function (err,res) {
				if(err) return done(err);
				res.body.success.should.be.true();
				done();
			});

		});

	});

	describe('delete /tags/:id',function () {
		it('should return error',function (done) {
			request.del('/tags/dddddd')
			.set('Authorization','Bearer ' + token)
			.expect(500,done);
		});
		it('should return success',function (done) {
			request.del('/tags/' + mockTagCatId)
			.set('Authorization','Bearer ' + token)
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function (err,res) {
				if(err) return done(err);
				res.body.success.should.be.true();
				done();
			});
		});
	});

});