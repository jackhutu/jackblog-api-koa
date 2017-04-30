import { test, describe, before, after, beforeEach,afterEach } from 'ava-spec'
import tools from '../../server/util/tools'

describe('test/util/tools.js => randomString', it => {
  it('should return 12 length string', async t => {
    let nickname = tools.randomString()
    t.is(nickname.length, 12)
  })  
  
  it('should return 6 length string', async t => {
    let nickname = tools.randomString(6)
    t.is(nickname.length, 6)
  })
})

describe('test/util/tools.js => extractImage', it => {
  it('should return images', async t => {
    let content = '![enter image description here](http://upload.jackhu.top/blog/article/1440865026231fd4242f507e7d30e682cadc0156bceeb.png "enter image title here")'
    let images = tools.extractImage(content)
    t.is(images.length, 1)
    t.is(images[0].url,'http://upload.jackhu.top/blog/article/1440865026231fd4242f507e7d30e682cadc0156bceeb.png')
  })  
  
  it('should return images', async t => {
    let content = 'enter image title here'
    let images = tools.extractImage(content)
    t.is(images.length, 0)
  })
})