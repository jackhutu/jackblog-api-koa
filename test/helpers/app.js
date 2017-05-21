import superkoa from 'superkoa'
import app from '../../server/app'

exports.koaApp = superkoa(app)