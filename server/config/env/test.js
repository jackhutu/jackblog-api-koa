'use strict'

// 测试环境配置
// ===========================
module.exports = {
  mongo: {
    uri: `mongodb://localhost/jackblog-test`
  },
  redis: {
    db: 2,
    dropBufferSupport: true
  },
  port:    process.env.PORT || 8080,
  seedDB: false,
  session:{
    cookie:  {maxAge: 60000*5}
  }  
}