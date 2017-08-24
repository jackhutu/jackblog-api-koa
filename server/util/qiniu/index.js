'use strict'

const config = require('../../config/env')
const qiniu = require('qiniu')
const mac = new qiniu.auth.digest.Mac(config.qiniu.app_key, config.qiniu.app_secret)
const putPolicy = new qiniu.rs.PutPolicy({
  scope: config.qiniu.bucket,
  returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
})
const uptoken = putPolicy.uploadToken(mac)

const qiniuConfig = new qiniu.conf.Config()

qiniuConfig.zone = qiniu.zone.Zone_z0
qiniuConfig.useHttpsDomain = true
//qiniuConfig.useCdnDomain = true

const bucket = config.qiniu.bucket
const formUploader = new qiniu.form_up.FormUploader(qiniuConfig)
const bucketManager = new qiniu.rs.BucketManager(mac, qiniuConfig)
exports.formUploader = formUploader
exports.bucketManager = bucketManager
exports.bucket = bucket

//上传文件
const putExtra = new qiniu.form_up.PutExtra()
exports.upload = function (path, key) {
  return new Promise(function(resolve, reject){
    formUploader.putFile(uptoken, key, path, putExtra, function(err,respBody, respInfo) {
      if (err) {
        reject(err)
      }
      if (respInfo.statusCode == 200) {
        respBody.url = config.qiniu.domain + respBody.key
        resolve(respBody)
      } else {
        reject(new Error('error status' + respInfo.statusCode))
      }
    })
  })
}

//将网络图片上传到七牛服务器
exports.fetch = function (resUrl, key) {
  return new Promise(function(resolve, reject){
		bucketManager.fetch(resUrl, bucket, key, function(err, respBody, respInfo) {
      if (err) {
        reject(err)
      }
      if (respInfo.statusCode == 200) {
        respBody.url = config.qiniu.domain + respBody.key
        resolve(respBody)
      } else {
        reject(new Error('error status' + respInfo.statusCode))
      }
		})
  })
}

//将源空间的指定资源移动到目标空间，或在同一空间内对资源重命名。
exports.move = function(srcKey,destKey, { force=false }){
	let srcBucket,destBucket
	srcBucket = destBucket = bucket
  return new Promise(function(resolve, reject){
		bucketManager.move(srcBucket, srcKey, destBucket, destKey, { force:force }, function(err, respBody, respInfo) {
			if (err) {
				reject(err)
			}
      if (respInfo.statusCode == 200) {
        resolve(respBody)
      } else {
        reject(new Error('error status' + respInfo.statusCode))
      }
		})
  })
}

//复制文件
exports.copy = function(srcKey, destKey, { force=false }){
	let srcBucket,destBucket
	srcBucket = destBucket = bucket
  return new Promise(function(resolve, reject){
		bucketManager.copy(srcBucket, srcKey, destBucket, destKey, { force:force }, function(err, respBody, respInfo) {
			if (err) {
				reject(err)
			}
      if (respInfo.statusCode == 200) {
        resolve(respBody)
      } else {
        reject(new Error('error status' + respInfo.statusCode))
      }
		})
  })
}

// 删除文件
exports.remove = function(key){
  return new Promise(function(resolve, reject){
		bucketManager.delete(bucket, key, function(err, respBody, respInfo) {
			if (err) {
				reject(err)
			}
      if (respInfo.statusCode == 200) {
        resolve(respBody)
      } else {
        reject(new Error('error status' + respInfo.statusCode))
      }
		})
  })
}
// 获取指定前缀文件列表
// @param options 列举操作的可选参数
//                prefix    列举的文件前缀
//                marker    上一次列举返回的位置标记，作为本次列举的起点信息
//                limit     每次返回的最大列举文件数量
//                delimiter 指定目录分隔符
exports.list = function(options){
	const defaultOptions = {
		limit: 30,
		prefix: 'blog/index',
		marker: '',
		delimiter: ''
	}
	options = Object.assign({}, defaultOptions, options)
  return new Promise(function(resolve, reject){
		bucketManager.listPrefix(bucket, options, function(err, respBody, respInfo) {
			if (err) {
				reject(err)
			}
      if (respInfo.statusCode == 200) {
				//如果这个nextMarker不为空，那么还有未列举完毕的文件列表，下次调用listPrefix的时候，
				//指定options里面的marker为这个值
				const nextMarker = respBody.marker
				const commonPrefixes = respBody.commonPrefixes
				respBody.items.forEach(function(item) {
					item.url = config.qiniu.domain + item.key
				})				
        resolve(respBody)
      } else {
        reject(new Error('error status' + respInfo.statusCode))
			}
		})
  })
}
