import assert from 'node:assert/strict'
import supertest from 'supertest'
import server from './index.js'

const request = supertest(server)

describe('Index', () => {
  it('get index', async () => {
    const res = await request.get('/')
    assert.equal(res.status, 200)
  })

  after(() => {
    server.close()
  })
})

