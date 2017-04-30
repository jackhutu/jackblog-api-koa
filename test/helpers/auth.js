import { koaApp } from './app'

exports.createUser = async (userModel,role,nickname,status) => {
  return await userModel.create({
    nickname: nickname || '测试' + new Date().getTime(),
    email:'test' + new Date().getTime() + '@tets.com',
    password:'test',
    role: role || 'admin',
    status: status || 1
  })
}

exports.createTagCat = async (TagCategoryModel,name) => {
  return await TagCategoryModel.create({
    name: name || '标签分类名' + new Date().getTime(),
    desc: '测试标签分类名'
  })
}

exports.createTag = async (TagModel,cid,name,isShow) => {
  return await TagModel.create({
    name: name || '标签名称' + new Date().getTime(),
    cid: cid,
    is_show: isShow || true
  })
}

exports.getToken = async (email)=> {
  const res = await koaApp
              .post('/auth/local')
              .send({ email: email, password:'test' })
              .redirects(false)
  return res.body.token
}