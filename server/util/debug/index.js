'use strict'

const pkg = require('../../../package.json')

module.exports = function(debugLevel) {
  return require('debug')(pkg.name + ':' + debugLevel)
}