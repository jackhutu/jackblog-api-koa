import { test, describe, before, after, beforeEach, afterEach } from 'ava-spec'
import { koaApp } from '../helpers/app'
import { UserSchema } from '../../server/model/user.model'
import { LogsSchema } from '../../server/model/logs.model'

const mockUsers = [
  'test01' + new Date().getTime() + '@tets.com',
  'test02' + new Date().getTime() + '@tets.com',
  'test03' + new Date().getTime() + '@tets.com'
]
let User, Logs
before(async t => {
  const mongoose = require('../../server/connect')
  mongoose.Promise = global.Promise
  User = mongoose.model('User', UserSchema)
  Logs = mongoose.model('Logs', LogsSchema)
  await User.create({
          nickname: '测试' + new Date().getTime(),
          email: mockUsers[0],
          password: 'test',
          role: 'user',
          status: 1
        }) 
  await User.create({
          nickname: '测试' + new Date().getTime(),
          email: mockUsers[1],
          password: 'test',
          role: 'user',
          status: 0
        }) 
  await User.create({
          nickname: '测试' + new Date().getTime(),
          email: mockUsers[2],
          password: 'test',
          role: 'user',
          status: 2
        })
})

after(async () => {
  await User.remove({ email: { $in: mockUsers } })
  await Logs.remove()
})

describe('test/auth/local.test.js => post /auth/local', it => {
  it.serial('should when password error return err', async t => {
    const res = await koaApp.post('/auth/local')
      .send({
        email: mockUsers[0],
        password: 'test888'
      })
    t.is(res.status, 403)
  })

  it.serial('should when email error return err', async t => {
    const res = await koaApp.post('/auth/local')
      .send({
        email: 'ttttt@ttttt.com',
        password: 'test'
      })
    t.is(res.status, 403)
  })

  it.serial('should when status 0 return err', async t => {
    const res = await koaApp.post('/auth/local')
      .send({
        email: mockUsers[1],
        password: 'test'
      })
    t.is(res.status, 403)
  })

  it.serial('should when status 2 return err', async t => {
    const res = await koaApp.post('/auth/local')
      .send({
        email: mockUsers[2],
        password: 'test'
      })
    t.is(res.status, 403)
  })

  it.serial('should login success return token', async t => {
    const res = await koaApp.post('/auth/local')
      .send({
        email: mockUsers[0],
        password: 'test'
      })
    t.is(res.status, 200)
  })
})