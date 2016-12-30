import { test, describe, before, after, beforeEach, afterEach } from 'ava-spec';
import { koaApp } from '../helpers/app';
import { createUser, getToken } from '../helpers/auth';
import { UserSchema } from '../../server/model/user.model';
import { LogsSchema } from '../../server/model/logs.model';
import { ArticleSchema } from '../../server/model/article.model';
import { CommentSchema } from '../../server/model/comment.model';
import config from '../../server/config/env';

let User, Logs, Article,Comment, token, mockUserId, mockArticleId, mockCommentId, mockReplyId;
before(async t => {
  const mongoose = require('../../server/connect');
  mongoose.Promise = require('bluebird');
  User = mongoose.model('User', UserSchema);
  Logs = mongoose.model('Logs', LogsSchema);
  Article = mongoose.model('Article', ArticleSchema);
  Comment = mongoose.model('Comment', CommentSchema);
  const user = await createUser(User, 'admin');
  mockUserId = user._id;
  const article = await Article.create({
    author_id: mockUserId,
    title: '第' + new Date().getTime() + '篇文章',
    content: '<p>我第n次爱你.</p>',
    status: 1
  });
  mockArticleId = article._id;
  token = await getToken(user.email);
});

after(async () => {
  await User.findByIdAndRemove(mockUserId);
  await Article.findByIdAndRemove(mockArticleId);
  await Logs.remove();
});

describe('test/api/comment.test.js => post /comment/addNewComment', it => {
  it.serial('should when not aid return error', async t => {
    const res = await koaApp.post('/comment/addNewComment')
			.set('Authorization','Bearer ' + token)
			.send({
				content:'最亲爱的评论',
			})
    t.is(res.status, 422);
  });

  it.serial('should when not content return error', async t => {
    const res = await koaApp.post('/comment/addNewComment')
			.set('Authorization','Bearer ' + token)
			.send({
				aid:mockArticleId,
				content:'',
			})
    t.is(res.status, 422);
  });

  it.serial('should create a new comment', async t => {
    const res = await koaApp.post('/comment/addNewComment')
			.set('Authorization','Bearer ' + token)
			.send({
				aid:mockArticleId,
				content:'最亲爱的评论',
			})
    t.is(res.status, 200);
    t.true(res.body.success);
    t.is(res.body.data.content, '最亲爱的评论');
		t.is(res.body.data.aid, mockArticleId.toString());
    mockCommentId = res.body.data._id;
  });
});

describe('test/api/comment.test.js => post /comment/:id/addNewReply', it => {
  it.serial('should when not content return error', async t => {
    const res = await koaApp.post('/comment/' + mockCommentId + '/addNewReply')
			.set('Authorization','Bearer ' + token)
			.send({
				content:''
			})
    t.is(res.status, 422);
  });

  it.serial('should create a new reply', async t => {
    const res = await koaApp.post('/comment/' + mockCommentId + '/addNewReply')
			.set('Authorization','Bearer ' + token)
			.send({
				content:'最好的回复'
			})
    t.is(res.status, 200);
    t.true(res.body.success);
    mockReplyId = res.body.data[0]._id;
  });
});
//由于travis只支持mongodb 2.4,而2.4不支持populate,所以跳过
describe('test/api/comment.test.js => get /comment/:id/getFrontCommentList', it => {
  it.serial('should return comment list', async t => {
    const res = await koaApp.get('/comment/' + mockArticleId + '/getFrontCommentList')
    t.is(res.status, 200);
    t.not(res.body.data.length, 0);
  });
});

describe('test/api/comment.test.js => put /comment/:id/delReply', it => {
  it.serial('should return comment reply', async t => {
    const res = await koaApp.put('/comment/' + mockCommentId + '/delReply')
			.set('Authorization','Bearer ' + token)
			.send({
				//rid:mockComment.reply[0]._id
			})
    t.is(res.status, 422);
  });

  it.serial('should when id error return error', async t => {
    const res = await koaApp.put('/comment/dddddddddd/delReply')
			.set('Authorization','Bearer ' + token)
			.send({
				rid:mockReplyId
			})
    t.is(res.status, 500);
  });

  it.serial('should return comment reply', async t => {
    const res = await koaApp.put('/comment/' + mockCommentId + '/delReply')
			.set('Authorization','Bearer ' + token)
			.send({
				rid:mockReplyId
			})
    t.is(res.status, 200);
    t.true(res.body.success);
  });
});

describe('test/api/comment.test.js => delete /comment/:id', it => {
  it.serial('should when id error return error', async t => {
    const res = await koaApp.del('/comment/dddddddddd')
			.set('Authorization','Bearer ' + token)
    t.is(res.status, 500);
  });

  it.serial('should return success', async t => {
    const res = await koaApp.del('/comment/' + mockCommentId)
			.set('Authorization','Bearer ' + token)
    t.is(res.status, 200);
    t.true(res.body.success);
  });
});