"use strict";

const app = require('../../server/app');
const request = require('supertest')(app.listen());
const should = require("should"); 
const mongoose = require('mongoose');
const	User = mongoose.model('User');
const Logs = mongoose.model('Logs');
const co = require("co");

describe('test/auth/local.test.js',function () {
	//测试需要一篇文章,和这篇文章的评论.
	const mockUsers = [
		'test01' + new Date().getTime() + '@tets.com',
		'test02' + new Date().getTime() + '@tets.com',
		'test03' + new Date().getTime() + '@tets.com'
	];
	before(co.wrap(function *() {
		yield User.create({
			nickname:'测试' + new Date().getTime(),
			email:mockUsers[0],
			password:'test',
			role:'user',
			status:1
		},{
			nickname:'测试' + new Date().getTime(),
			email:mockUsers[1],
			password:'test',
			role:'user',
			status:0
		},{
			nickname:'测试' + new Date().getTime(),
			email:mockUsers[2],
			password:'test',
			role:'user',
			status:2
		})
	}));

	after(co.wrap(function *() {
		yield User.remove({email:{$in:mockUsers}});
		yield Logs.remove();
	}));

	describe('post /auth/local',function () {
		it('should when password error return err',function (done) {
			request.post('/auth/local')
			.send({
				email:mockUsers[0],
				password:'test888'
			})
			.expect(403,done);

		});
		it('should when email error return err',function (done) {
			request.post('/auth/local')
			.send({
				email:'ttttt@ttttt.com',
				password:'test'
			})
			.expect(403,done);
		});
		it('should when status 0 return err',function (done) {
			request.post('/auth/local')
			.send({
				email:mockUsers[1],
				password:'test'
			})
			.expect(403,done);

		});

		it('should when status 2 return err',function (done) {
			request.post('/auth/local')
			.send({
				email:mockUsers[2],
				password:'test'
			})
			.expect(403,done);

		});

		it('should login success return token',function (done) {
			request.post('/auth/local')
			.send({
				email:mockUsers[0],
				password:'test'
			})
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function (err,res) {
				if(err) return done(err);
				res.body.token.should.be.String();
				done();
			});
		});

	});


});