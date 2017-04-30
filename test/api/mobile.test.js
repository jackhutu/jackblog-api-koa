import { koaApp } from '../helpers/app'
import {describe} from 'ava-spec'

describe('test/api/mobile.test.js', it => {
  it('should return success status 200',async t => {
		const res = await koaApp.get('/mobile/getApps')
		t.is(res.status, 200)
		t.true(res.body.success)
  })
})