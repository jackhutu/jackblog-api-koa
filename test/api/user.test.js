import { test, describe, before, after, beforeEach } from 'ava-spec'
import { koaApp } from '../helpers/app'
import { createUser, getToken } from '../helpers/auth'
import { UserSchema } from '../../server/model/user.model'
import { LogsSchema } from '../../server/model/logs.model'
import config from '../../server/config/env'

let User, Logs, token,mockUserId,mockAdminId,mockUpdateNickName,mockAdminNickname = '测试' + new Date().getTime()
before(async t => {
  const mongoose = require('../../server/connect')
  mongoose.Promise = require('bluebird')
  User = mongoose.model('User', UserSchema)
  Logs = mongoose.model('Logs', LogsSchema)
  const user = await createUser(User,'admin',mockAdminNickname)
  mockAdminId = user._id
  token = await getToken(user.email)
})

after(async () => {
  await User.findByIdAndRemove(mockAdminId)
  await Logs.remove()
})

describe('test/api/user.test.js => post /users/addUser', it => {
  it.serial('should when not nickname return error', async t => {
    const res = await koaApp.post('/users/addUser')
			.set('Authorization','Bearer ' + token)
			.send({
				email:'test@test.com' + new Date().getTime(),
				password:'test'
			})
    t.is(res.status, 422)
  })

  it.serial('should when not email return error', async t => {
    const res = await koaApp.post('/users/addUser')
			.set('Authorization','Bearer ' + token)
			.send({
				nickname: '呢称' + new Date().getTime(),
				password:'test'
			})
    t.is(res.status, 422)
  })

  it.serial('should when nickname error return error', async t => {
    const res = await koaApp.post('/users/addUser')
			.set('Authorization','Bearer ' + token)
			.send({
				nickname: '呢称' + new Date().getTime(),
				password:'test'
			})
    t.is(res.status, 422)
  })

  it.serial('should when email error return error', async t => {
    const res = await koaApp.post('/users/addUser')
			.set('Authorization','Bearer ' + token)
			.send({
				nickname: '呢称' + new Date().getTime(),
				password:'test'
			})
    t.is(res.status, 422)
  })

  var nickname = '呢称' + new Date().getTime()
  it.serial('should return new user', async t => {
    const res = await koaApp.post('/users/addUser')
			.set('Authorization','Bearer ' + token)
			.send({
				nickname: nickname,
				email:'test@test.com' + new Date().getTime(),
				password:'test'
			})
    t.is(res.status, 200)
    t.true(res.body.success)
    mockUserId = res.body.user_id
  })
  it.serial('should same nickname return error', async t => {
    const res = await koaApp.post('/users/addUser')
			.set('Authorization','Bearer ' + token)
			.send({
				nickname: nickname,
				email:'test@test.com' + new Date().getTime(),
				password:'test'
			})
    t.is(res.status, 500)
  })
})

describe('test/api/user.test.js => put /users/:id/updateUser', it => {
  mockUpdateNickName = '呢称' + new Date().getTime()
  it.serial('should when not nickname return error', async t => {
    const res = await koaApp.put('/users/' + mockUserId + '/updateUser')
			.set('Authorization','Bearer ' + token)
			.send({
				email:'test@test.com' + new Date().getTime(),
				status:1
			})
    t.is(res.status, 422)
  })

  it.serial('should when not email return error', async t => {
    const res = await koaApp.put('/users/' + mockUserId + '/updateUser')
			.set('Authorization','Bearer ' + token)
			.send({
				nickname:mockUpdateNickName,
				status:1
			})
    t.is(res.status, 422)
  })

  it.serial('should when nickname error return error', async t => {
    const res = await koaApp.put('/users/' + mockUserId + '/updateUser')
			.set('Authorization','Bearer ' + token)
			.send({
				nickname:'jack^^%%',
				email:'test@test.com' + new Date().getTime(),
				status:1
			})
    t.is(res.status, 422)
  })

  it.serial('should when email error return error', async t => {
    const res = await koaApp.put('/users/' + mockUserId + '/updateUser')
			.set('Authorization','Bearer ' + token)
			.send({
				nickname:mockUpdateNickName,
				email:'test.com',
				status:1
			})
    t.is(res.status, 422)
  })


  it.serial('should return update user', async t => {
    const res = await koaApp.put('/users/' + mockUserId + '/updateUser')
			.set('Authorization','Bearer ' + token)
			.send({
				nickname:mockUpdateNickName,
				email:'test@test.com' + new Date().getTime(),
				status:1
			})
    t.is(res.status, 200)
    t.true(res.body.success)
  })
  it.serial('should update password return success', async t => {
    const res = await koaApp.put('/users/' + mockUserId + '/updateUser')
			.set('Authorization','Bearer ' + token)
			.send({
				nickname:mockUpdateNickName,
				email:'test@test.com' + new Date().getTime(),
				status:1,
				newPassword:'testpwd'
			})
    t.is(res.status, 200)
    t.true(res.body.success)
  })

  it.serial('should same nickname return error', async t => {
    const res = await koaApp.put('/users/' + mockUserId + '/updateUser')
			.set('Authorization','Bearer ' + token)
			.send({
				nickname:mockAdminNickname,
				email:'test@test.com' + new Date().getTime(),
				status:1
			})
    t.is(res.status, 500)
  })
})

describe('test/api/user.test.js => put /users/mdUser', it => {
  it.serial('should when not nickname return error', async t => {
    const res = await koaApp.put('/users/mdUser')
			.set('Authorization','Bearer ' + token)
    t.is(res.status, 422)
  })

  it.serial('should when nickname error return error', async t => {
    const res = await koaApp.put('/users/mdUser')
			.set('Authorization','Bearer ' + token)
			.send({
				nickname:'jack^^&&'
			})
    t.is(res.status, 422)
  })

  it.serial('should return my user', async t => {
    const res = await koaApp.put('/users/mdUser')
			.set('Authorization','Bearer ' + token)
			.send({
				nickname:'呢称' + new Date().getTime()
			})
    t.is(res.status, 200)
    t.true(res.body.success)
  })

  it.serial('should when same nickname return error', async t => {
    const res = await koaApp.put('/users/mdUser')
			.set('Authorization','Bearer ' + token)
			.send({
				nickname: mockUpdateNickName
			})
    t.is(res.status, 500)
  })
})

describe('test/api/user.test.js => get /users/getUserList', it => {
  it.serial('should return users list', async t => {
    const res = await koaApp.get('/users/getUserList')
				.set('Authorization','Bearer ' + token)
    t.is(res.status, 200)
    t.not(res.body.data.length, 0)
    t.not(res.body.count, 0)
  })

  it.serial('should sort false return users list', async t => {
    const res = await koaApp.get('/users/getUserList')
				.set('Authorization','Bearer ' + token)
				.query({
					itemsPerPage:1,
					sortName:'',
					sortOrder:'false'
				})
    t.is(res.status, 200)
    t.not(res.body.data.length, 0)
    t.not(res.body.count, 0)   
  })
})

describe('test/api/user.test.js => get /users/getUserProvider', it => {
  it.serial('should return users list', async t => {
    const res = await koaApp.get('/users/getUserProvider')
			.set('Authorization','Bearer ' + token)
    t.is(res.status, 200)
  })
})

describe('test/api/user.test.js => get /users/snsLogins', it => {
  it.serial('should return 200', async t => {
    const res = await koaApp.get('/users/snsLogins')
    t.is(res.status, 200)
  })
})

describe('test/api/user.test.js => get /users/me', it => {
  it.serial('should return me info', async t => {
    const res = await koaApp.get('/users/me').set('Authorization','Bearer ' + token)
    t.is(res.status, 200)
  })
})

describe('test/api/user.test.js => del /users/:id', it => {
  it.serial('should if userid === req.user._id return error', async t => {
    const res = await koaApp.del('/users/' + mockAdminId)
			.set('Authorization','Bearer ' + token)
    t.is(res.status, 403)
  })

  it.serial('should if userId error return error', async t => {
    const res = await koaApp.del('/users/dddddd')
			.set('Authorization','Bearer ' + token)
    t.is(res.status, 500)
  })

  it.serial('should return me info', async t => {
    const res = await koaApp.del('/users/' + mockUserId)
			.set('Authorization','Bearer ' + token)
    t.is(res.status, 200)
    t.true(res.body.success)
  })
})