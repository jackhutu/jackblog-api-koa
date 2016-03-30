'use strict';

// 开发环境配置
// ==================================
module.exports = {
  mongo: {
    uri: 'mongodb://localhost/jackblog-dev'
  },
  redis: {
    db: 0
  },
  seedDB: true,
  session:{
    cookie:  {maxAge: 60000*5}
  }
};
