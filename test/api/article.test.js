import { test, describe, before, after, beforeEach,afterEach } from 'ava-spec'
import { koaApp } from '../helpers/app'
import { createUser, getToken } from '../helpers/auth'
import { UserSchema } from '../../server/model/user.model'
import { LogsSchema } from '../../server/model/logs.model'
import { ArticleSchema } from '../../server/model/article.model'
import config from '../../server/config/env'
const redis = require('../../server/util/redis')
import sinon from 'sinon'
config.qiniu.app_key = 'test'
config.qiniu.app_secret = 'test'
const qiniuHelper = require('../../server/util/qiniu')

let User, Logs, Article, token, mockArticleId, mockAdminId, mockTagId = '55e127401cfddd2c4be93f6b', mockTagIds = ['55e127401cfddd2c4be93f6b']
before(async t => {
  const mongoose = require('../../server/connect')
  mongoose.Promise = global.Promise
  User = mongoose.model('User', UserSchema)
  Logs = mongoose.model('Logs', LogsSchema)
  Article = mongoose.model('Article', ArticleSchema)
  const user = await createUser(User, 'admin')
  mockAdminId = user._id
  token = await getToken(user.email)
})

after(async () => {
  await User.findByIdAndRemove(mockAdminId)
  await Article.remove()
  await Logs.remove()
  await redis.del('indexImages')
})

describe('test/api/article.test.js => post /article/addArticle', it => {
  it.serial('should not title return error', async t => {
    const res = await koaApp.post('/article/addArticle')
      .set('Authorization', 'Bearer ' + token)
      .send({
        content: '测试文章内容![enter image description here](https://upload.jackhu.top/test/111.png "enter image title here")',
        status: 1
      })
    t.is(res.status, 422)
  })

  it.serial('should not content return error', async t => {
    const res = await koaApp.post('/article/addArticle')
      .set('Authorization', 'Bearer ' + token)
      .send({
        title: '测试文章标题' + new Date().getTime(),
        status: 1
      })
    t.is(res.status, 422)
  })

  it.serial('should throw error return 500', async t => {
    let stubArticle = sinon.stub(Article, 'create').returns(Promise.reject(new TypeError('error message')))

    const res = await koaApp.post('/article/addArticle')
      .set('Authorization', 'Bearer ' + token)
      .send({
        title: '测试文章标题' + new Date().getTime(),
        content: '测试文章内容![enter image description here](https://upload.jackhu.top/test/111.png "enter image title here")',
        status: 1,
        tags: ['55e127401c2dbb2c4be93f6b']
      })
    t.is(res.status, 500)
    stubArticle.restore()
  })

  it.serial('should create a new article', async t => {
    const res = await koaApp.post('/article/addArticle')
      .set('Authorization', 'Bearer ' + token)
      .send({
        title: '测试文章标题' + new Date().getTime(),
        content: '测试文章内容![enter image description here](https://upload.jackhu.top/test/111.png "enter image title here")',
        status: 1,
        tags: mockTagIds
      })
    t.is(res.status, 200)
    t.true(res.body.success)
    mockArticleId = res.body.article_id
  })

})

describe('test/api/article.test.js => put /article/:id/updateArticle', it => {
  it.serial('should not title return error', async t => {
    const res = await koaApp.put('/article/' + mockArticleId + '/updateArticle')
      .set('Authorization', 'Bearer ' + token)
      .send({
        content: '新的文章内容![enter image description here](https://upload.jackhu.top/test/111.png "enter image title here")',
        status: 1
      })
    t.is(res.status, 422)
  })

  it.serial('should not content return error', async t => {
    const res = await koaApp.put('/article/' + mockArticleId + '/updateArticle')
      .set('Authorization', 'Bearer ' + token)
      .send({
        title: '新的标题' + new Date().getTime(),
        status: 1
      })
    t.is(res.status, 422)
  })

  it.serial('should return update a article', async t => {
    const res = await koaApp.put('/article/' + mockArticleId + '/updateArticle')
      .set('Authorization', 'Bearer ' + token)
      .send({
        _id: mockArticleId,
        title: '更新的标题' + new Date().getTime(),
        content: '更新的文章内容![enter image description here](https://upload.jackhu.top/test/111.png "enter image title here")',
        status: 1,
        isRePub: true,
        tags: mockTagIds
      })
    t.is(res.status, 200)
    t.true(res.body.success)
  })
})

describe('test/api/article.test.js => get /article/getArticleList', it => {
  it.serial('should return blog list', async t => {
    const res = await koaApp.get('/article/getArticleList')
      .set('Authorization', 'Bearer ' + token)
    t.is(res.status, 200)
    t.not(res.body.data.length, 0)
    t.not(res.body.count, 0)
  })

  it.serial('should sort return blog list', async t => {
    const res = await koaApp.get('/article/getArticleList')
      .set('Authorization', 'Bearer ' + token)
      .query({
        sortOrder: 'false',
        sortName: 'visit_count',
        itemsPerPage: 2
      })
    t.is(res.status, 200)
  })
})

describe('test/api/article.test.js => upload image', it => {
  it.serial('should not file parmas return error', async t => {
    const res = await koaApp.post('/article/uploadImage')
      .set('Authorization', 'Bearer ' + token)
    t.is(res.status, 422)
  })

  it.serial('should resturn success', async t => {
    let stubQiniu = sinon.stub(qiniuHelper, 'upload').returns(Promise.resolve({
      url: "https://upload.jackhu.top/article/article/test.png"
    }))
    const res = await koaApp.post('/article/uploadImage')
      .set('Authorization', 'Bearer ' + token)
      .attach('file', __dirname + '/upload.test.png')
 
    t.is(res.status, 200)
    t.true(res.body.success)
    t.is(res.body.img_url, 'https://upload.jackhu.top/article/article/test.png')
    t.true(stubQiniu.calledOnce)
    stubQiniu.restore()
  })
})

describe('test/api/article.test.js => fetch image', it => {
  it.serial('should resturn success', async t => {
    let stubQiniu = sinon.stub(qiniuHelper, 'fetch').returns(Promise.resolve({
      url: "https://upload.jackhu.top/article/article/test.png"
    }))
    const res = await koaApp.post('/article/fetchImage')
      .set('Authorization', 'Bearer ' + token)
      .send({
        url: 'https://www.test.com/test.png'
      })
    t.is(res.status, 200)
    t.true(res.body.success)
    t.is(res.body.img_url, 'https://upload.jackhu.top/article/article/test.png')
    t.true(stubQiniu.calledOnce)
    stubQiniu.restore()
  })

  it.serial('should not url parmas return error', async t => {
    const res = await koaApp.post('/article/fetchImage')
      .set('Authorization', 'Bearer ' + token)
    t.is(res.status, 422)
  })
})

describe('test/api/article.test.js => get /article/:id/getArticle', it => {
  it.serial('should return a article', async t => {
    const res = await koaApp.get('/article/' + mockArticleId + '/getArticle')
      .set('Authorization', 'Bearer ' + token)
    t.is(res.status, 200)
    t.is(res.body.data._id, mockArticleId.toString())
  })
})

describe('test/api/article.test.js => get /article/getFrontArticleList', it => {
  it.serial('should return blog list', async t => {
    const res = await koaApp.get('/article/getFrontArticleList')
    t.is(res.status, 200)
    t.not(res.body.data.length, 0)
  })
  it.serial('should when has tagId return list', async t => {
    const res = await koaApp.get('/article/getFrontArticleList')
      .query({
        itemsPerPage: 1,
        sortName: 'visit_count',
        tagId: mockTagId
      })
    t.is(res.status, 200)
  })
})

describe('test/api/article.test.js => get /article/getFrontArticleCount', it => {
  it.serial('should return blog list count', async t => {
    const res = await koaApp.get('/article/getFrontArticleCount')
    t.is(res.status, 200)
    t.true(res.body.success)
    t.not(res.body.count, 0)
  })

  it.serial('should when has tagId return count', async t => {
    const res = await koaApp.get('/article/getFrontArticleCount')
      .query({
        itemsPerPage: 1,
        sortName: 'visit_count',
        tagId: mockTagId
      })
    t.is(res.status, 200)
    t.true(res.body.success)
    //t.not(res.body.count, 0)
  })
})

describe('test/api/article.test.js => get /article/:id/getFrontArticle', it => {
  it.serial('should return article', async t => {
    const res = await koaApp.get('/article/' + mockArticleId + '/getFrontArticle')
    t.is(res.status, 200)
    t.is(res.body.data._id, mockArticleId.toString())
  })
})

describe('test/api/article.test.js => get /article/getIndexImage', it => {
  var stubQiniu
  beforeEach(function () {
    stubQiniu = sinon.stub(qiniuHelper, 'list')
  })
  afterEach(function () {
    qiniuHelper.list.restore()
  })

  it.serial('should return default index image', async t => {
    stubQiniu.returns(Promise.resolve({ items: [1, 2, 3, 4, 5].map(i => ({ key: i })) }))
    const res = await koaApp.get('/article/getIndexImage')
    t.is(res.status, 200)
    t.true(res.body.success)
    t.true(stubQiniu.calledOnce)
  })

  it.serial('should return redis image', async t => {
    const res = await koaApp.get('/article/getIndexImage')
    t.is(res.status, 200)
    t.true(res.body.success)
  })
})

describe('test/api/article.test.js => get /article/:id/getPrenext', it => {
  let nextArticleId
  before(async () => {
    const article = await Article.create({
      title: '测试文章标题' + new Date().getTime(),
      content: '测试文章内容![enter image description here](https://upload.jackhu.top/test/111.png "enter image title here")',
      status: 1,
      tags: mockTagIds
    })
    nextArticleId = article._id
  })
  after(async ()=>{
    await Article.findByIdAndRemove(nextArticleId)
  })

  it.serial('should return next and prev blog', async t => {
    const res = await koaApp.get('/article/' + mockArticleId + '/getPrenext')
    t.is(res.status, 200)
  })

  it.serial('should when has tagId return nextpre blog', async t => {
    const res = await koaApp.get('/article/' + mockArticleId + '/getPrenext')
			.query({
				sortName:'visit_count',
				tagId:mockTagId
			})
    t.is(res.status, 200)
  })
})

describe('test/api/article.test.js => put /article/:id/toggleLike', it => {
  it.serial('should add like return success', async t => {
    const res = await koaApp.put('/article/' + mockArticleId + '/toggleLike')
			.set('Authorization', 'Bearer ' + token)
    t.is(res.status, 200)
    t.true(res.body.success)
    t.true(res.body.isLike)
    t.is(res.body.count, 2)
  })

  it.serial('should when second toggle like return success', async t => {
    const res = await koaApp.put('/article/' + mockArticleId + '/toggleLike')
			.set('Authorization', 'Bearer ' + token)
    t.is(res.status, 200)
    t.true(res.body.success)
    t.false(res.body.isLike)
    t.is(res.body.count, 1)
  })
})

describe('test/api/article.test.js => delete /article/:id', it => {
  it.serial('should when id error return error', async t => {
    const res = await koaApp.del('/article/ddddddd').set('Authorization', 'Bearer ' + token)
    t.is(res.status, 500)
  })

  it.serial('should return success', async t => {
    const res = await koaApp.del('/article/' + mockArticleId)
			.set('Authorization', 'Bearer ' + token)
    t.is(res.status, 200)
    t.true(res.body.success)
  })
})