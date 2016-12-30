import { test, describe, before, after, beforeEach } from 'ava-spec';
import { koaApp } from '../helpers/app';
import { createUser, getToken, createTagCat, createTag } from '../helpers/auth';
import { UserSchema } from '../../server/model/user.model';
import { LogsSchema } from '../../server/model/logs.model';
import { TagCategorySchema } from '../../server/model/tag.category.model';
import { TagSchema } from '../../server/model/tag.model';
import config from '../../server/config/env';

let User, Logs, Tag, TagCategory, token, mockTagCatId, mockTagCatName, mockTagId, mockTagName, mockUserId;
before(async t => {
  const mongoose = require('../../server/connect');
  mongoose.Promise = require('bluebird');
  User = mongoose.model('User', UserSchema);
  Logs = mongoose.model('Logs', LogsSchema);
  Tag = mongoose.model('Tag', TagSchema);
  TagCategory = mongoose.model('TagCategory', TagCategorySchema);
  const user = await createUser(User, 'admin');
  mockUserId = user._id;
  const tagCat = await createTagCat(TagCategory);
  mockTagCatId = tagCat._id;
  mockTagCatName = tagCat.name;
  const tag = await createTag(Tag, mockTagCatId)
  mockTagId = tag._id;
  mockTagName = tag.name;
  token = await getToken(user.email);
});

after(async () => {
  await User.findByIdAndRemove(mockUserId);
  await Tag.findByIdAndRemove(mockTagId);
  await TagCategory.findByIdAndRemove(mockTagCatId);
  await Logs.remove();
});

describe('test/api/tags.test.js => post /tags/addTagCat', it => {

  it.serial('should when not name return error', async t => {
    const res = await koaApp.post('/tags/addTagCat')
      .set('Authorization', 'Bearer ' + token)
      .send({
        desc: '测试标签分类名'
      });
    t.is(res.status, 422);
  });

  it.serial('should when second add catName return error', async t => {

    const res = await koaApp.post('/tags/addTagCat').set('Authorization', 'Bearer ' + token).send({
        name: mockTagCatName,
        desc: '测试标签分类名'
      });

    t.is(res.status, 403);
  });

  it.serial('should return new tag category', async t => {
    const res = await koaApp.post('/tags/addTagCat').set('Authorization', 'Bearer ' + token).send({
        name: '标签分类名' + new Date().getTime(),
        desc: '测试标签分类名'
      });
    
    t.is(res.status, 200);
    t.true(res.body.success);
    await TagCategory.findByIdAndRemove(res.body.cat_id)
  });
});

describe('test/api/tags.test.js => post /tags/addTag', it => {
  it.serial('should when not name return error', async t => {
    const res = await koaApp.post('/tags/addTag')
      .set('Authorization', 'Bearer ' + token)
      .send({
        cid: mockTagCatId,
        is_show: true
      })
    t.is(res.status, 422);
  });

  it.serial('should when not cid return error', async t => {
    const res = await koaApp.post('/tags/addTag')
      .set('Authorization', 'Bearer ' + token)
      .send({
        name: '标签名称' + new Date().getTime(),
        is_show: true
      })
    t.is(res.status, 422);
  });

  it.serial('should return new tag', async t => {
    const res = await koaApp.post('/tags/addTag')
      .set('Authorization', 'Bearer ' + token)
      .send({
        name: '标签名称' + new Date().getTime(),
        cid: mockTagCatId,
        is_show: true
      })
    t.is(res.status, 200);
    t.true(res.body.success);
    await Tag.findByIdAndRemove(res.body.tag_id);
  });

  it.serial('should when second add tagName return error', async t => {
    const res = await koaApp.post('/tags/addTag')
      .set('Authorization', 'Bearer ' + token)
      .send({
        name: mockTagName,
        cid: mockTagCatId,
        is_show: true
      })
    t.is(res.status, 403);
  });
})

describe('test/api/tags.test.js => put /tags/:id/updateTagCat', it => {
  it.serial('should return update tag category', async t => {
    const res = await koaApp.put('/tags/' + mockTagCatId + '/updateTagCat')
      .set('Authorization', 'Bearer ' + token)
      .send({
        _id: mockTagCatId,
        name: '新的标签分类名称' + new Date().getTime(),
        desc: '新的描述'
      })
    t.is(res.status, 200);
    t.true(res.body.success);
  });
})

describe('test/api/tags.test.js => put /tags/:id/updateTag', it => {
  it.serial('should return update tag category', async t => {
    const res = await koaApp.put('/tags/' + mockTagId + '/updateTag')
      .set('Authorization', 'Bearer ' + token)
      .send({
        _id: mockTagId,
        name: '新的分类名称' + new Date().getTime()
      })
    t.is(res.status, 200);
    t.true(res.body.success);
  });
})

describe('test/api/tags.test.js => get /tags/getTagCatList', it => {
  it.serial('should return tag category list', async t => {
    const res = await koaApp.get('/tags/getTagCatList')
      .set('Authorization', 'Bearer ' + token)
    t.is(res.status, 200);
    t.not(res.body.data.length, 0);
  });
})

describe('test/api/tags.test.js => get /tags/:id/getTagList', it => {
  it.serial('should return tag list in category', async t => {
    const res = await koaApp.get('/tags/' + mockTagCatId + '/getTagList')
      .set('Authorization', 'Bearer ' + token)
    t.is(res.status, 200);
    t.not(res.body.data.length, 0);
  });

  it.serial('should return all tag list', async t => {
    const res = await koaApp.get('/tags/0/getTagList')
      .set('Authorization', 'Bearer ' + token)
    t.is(res.status, 200);
    t.not(res.body.data.length, 0);
  });
})

describe('test/api/tags.test.js => get /tags/getFrontTagList', it => {
  it.serial('should return tag list to frontend', async t => {
    const res = await koaApp.get('/tags/getFrontTagList')
    t.is(res.status, 200);
    t.not(res.body.data.length, 0);
  });
})

describe('test/api/tags.test.js => delete /tags/:id', it => {
  it.serial('should return error', async t => {
    const res = await koaApp.del('/tags/' + mockTagCatId).set('Authorization', 'Bearer ' + token)
    t.is(res.status, 403);
  });
})

describe('test/api/tags.test.js => delete /tags/:id/deleteTag', it => {
  it.serial('should return error', async t => {
    const res = await koaApp.del('/tags/dddddd/deleteTag').set('Authorization', 'Bearer ' + token)
    t.is(res.status, 500);
  });

  it.serial('should return success', async t => {
    const res = await koaApp.del('/tags/' + mockTagId + '/deleteTag')
      .set('Authorization', 'Bearer ' + token)
    t.is(res.status, 200);
    t.true(res.body.success);
  });
})

describe('test/api/tags.test.js => delete /tags/:id', it => {
  it.serial('should return error', async t => {
    const res = await koaApp.del('/tags/dddddd')
      .set('Authorization', 'Bearer ' + token)
    t.is(res.status, 500);
  });

  it.serial('should return success', async t => {
    try {
      const res = await koaApp.del('/tags/' + mockTagCatId)
        .set('Authorization', 'Bearer ' + token)
      t.is(res.status, 200);
      t.true(res.body.success);     
    } catch (error) {
      t.ifError(error, '错误')
    }
  });
})