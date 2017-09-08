'use strict'

const assert = require('assert')
const { service, extension } = require('../../../lib/database')
const { $ } = require('../../../lib/database/Reference')

/* global describe it */

describe('Database Service', () => {
  const app = {
    options: {
      databaseURL: 'sample-app.firebaseio.com'
    }
  }

  const admin = {
    database () {
      return service(app)
    }
  }

  for (let key in extension) {
    admin.database[key] = extension[key]
  }

  describe('Service Instance', () => {
    it('should successfully create a database instance', () => {
      const database = service(app)

      assert.deepEqual(Object.keys(database), ['ref'])
    })
  })

  describe('admin.database()', () => {
    it('should successfully create a database instance', () => {
      assert.deepEqual(Object.keys(admin.database()), ['ref'])
    })
  })

  describe('Service Extension', () => {
    const data = {
      heros: [
        { firstname: 'Rosa Louise', lastname: 'McCauley Parks', born: 1913, countryCode: 'us' },
        { firstname: 'Martin Luther', lastname: 'King Jr.', born: 1929, countryCode: 'us' },
        { firstname: 'George', lastname: 'Washington', born: 1732, countryCode: 'us' },
        { firstname: 'Chaka', lastname: 'Zulu', born: 1787, countryCode: 'sa' },
        { firstname: 'William', lastname: 'Shakespeare', born: 1564, countryCode: 'uk' }
      ],
      countries: [
        { code: 'us', name: 'United States' },
        { code: 'sa', name: 'South Africa' },
        { code: 'uk', name: 'United Kingdom' }
      ]
    }

    describe('admin.database.import()', () => {
      it('should successfully import users list', () => {
        admin.database.import(data)

        const key = 'heros'
        const path = 'countries/0/code'
        const ref = service(app).ref(key).child(path)
        const expected = `https://${app.options.databaseURL}/${key}/${path}`

        assert.equal(ref.toString(), expected)
      })
    })

    describe('admin.database.clear()', () => {
      it('should successfully clear users list', () => {
        admin.database.import(data)
        admin.database.clear()

        assert.deepEqual($.references, {})
      })
    })
  })
})
