"use strict";

const should = require("should");
const mongoose = require("mongoose");
const User = mongoose.model('User');

exports.createUser = function (role,nickname,status) {
	return function *() {
		return yield User.create({
			nickname: nickname || '测试' + new Date().getTime(),
			email:'test' + new Date().getTime() + '@tets.com',
			password:'test',
			role: role || 'admin',
			status: status || 1
		})
		//
	};
}

exports.getToken = function (agent, email) {
	return new Promise(function (resolve, reject) {
		agent
		.post('/auth/local')
		.set("Content-Type", "application/json")
		.send({ email: email, password:'test' })
		.redirects(false)
		.expect(200)
		.end(function(err, res) {
		  if (err) { reject(err); }
		  should.exist(res.body);
		  should.exist(res.body.token);
		  resolve(res.body.token);
		});
	    // var req = new XMLHttpRequest();
	    // req.open('GET', URL, true);
	    // req.onload = function () {
	    //     if (req.status === 200) {
	    //         resolve(req.responseText);
	    //     } else {
	    //         reject(new Error(req.statusText));
	    //     }
	    // };
	    // req.onerror = function () {
	    //     reject(new Error(req.statusText));
	    // };
	    // req.send();
	});
}