import { test, describe, before, after, beforeEach } from 'ava-spec';
import { koaApp } from '../helpers/app';
import { createUser, getToken } from '../helpers/auth';
import { UserSchema } from '../../server/model/user.model';
import { LogsSchema } from '../../server/model/logs.model';
import config from '../../server/config/env';

let User, Logs, token, mockLogId, mockUserId;
before(async t => {
  const mongoose = require('../../server/connect');
  mongoose.Promise = require('bluebird');
  User = mongoose.model('User', UserSchema);
  Logs = mongoose.model('Logs', LogsSchema);
  const user = await createUser(User, 'admin');
  mockUserId = user._id;
  const log = await Logs.create({
    content: '删除用户.',
    uid: mockUserId,
    type: 'user'
  }, {
      content: '删除文章.',
      uid: mockUserId,
      type: 'article'
    });
  mockLogId = log._id;
  token = await getToken(user.email);
});

after(async () => {
  await User.findByIdAndRemove(mockUserId);
  await Logs.remove();
});

describe('test/api/logs.test.js', it => {
  it('should return logs list', async t => {
    const res = await koaApp.get('/logs/getLogsList').set('Authorization', 'Bearer ' + token)
    t.is(res.status, 200);
    t.not(res.body.data.length, 0);
    t.not(res.body.count, 0);
  });

  it('should when sort desc return logs list', async t => {
    const res = await koaApp.get('/logs/getLogsList')
      .query({
        itemsPerPage: 1,
        currentPage: 2,
        sortOrder: 'false',
        sortName: ''
      }).set('Authorization', 'Bearer ' + token)
    t.is(res.status, 200);
    t.not(res.body.data.length, 0);
    t.not(res.body.count, 0);
  });

});