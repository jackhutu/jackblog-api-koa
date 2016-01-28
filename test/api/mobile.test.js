"use strict";

const app = require('../../server/app');
const request = require('supertest')(app.listen());
const should = require("should"); 

describe('test/api/mobile.test.js',function () {
	describe('get /mobile/getApps',function () {
		it('should return success status 200',function (done) {
			request.get('/mobile/getApps')
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function (err,res) {
				if(err) return done(err);
				res.body.success.should.be.true();
				done();
			});
		});
	})
})