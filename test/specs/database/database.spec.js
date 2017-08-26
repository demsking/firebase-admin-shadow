'use strict'

const assert = require('assert')
const { service, extension } = require('../../../lib/database')

/* global describe it */

describe('Database Service', () => {
  describe('Service Instance', () => {
    const key = 'users'
    const app = {
      options: {
        databaseURL: 'sample-app.firebaseio.com'
      }
    }

    it('should successfully create a database instance', () => {
      const database = service(app)

      assert.deepEqual(Object.keys(database), ['ref'])
    })
  })
})
