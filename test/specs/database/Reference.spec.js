'use strict'

const assert = require('assert')
const { Reference } = require('../../../lib/database/Reference')

/* global describe it */

describe('Reference', () => {
  beforeEach(() => {
    Reference.clear()
  })

  const key = 'key'
  const app = {
    options: {
      databaseURL: 'sample-app.firebaseio.com'
    }
  }

  describe('constructor()', () => {
    it('should successfully instanciate an object', () => {
      const ref = Reference.get(key, app)

      assert.equal(ref.key, key)
      assert.equal(ref.root, null)
      assert.equal(ref.parent, null)
      assert.deepEqual(ref.app, app)
    })
  })

  describe('child()', () => {
    it('should successfully create a child', () => {
      const usersRef = Reference.get('users', app)
      const adaRef = usersRef.child('ada')
      const adaFirstNameRef = adaRef.child('name/first')
      const path = adaFirstNameRef.toString()

      assert.equal(path, `https://${app.options.databaseURL}/users/ada/name/first`)
    })
  })

  describe('endAt()', () => {
    it('should successfully find all dinosaurs whose names come before Pterodactyl lexicographically', () => {
      const ref = Reference.get('dinosaurs');

      return ref.orderByKey().endAt('pterodactyl')
        .once('child_added', (snapshot) => {
          console.log(snapshot.key)
        })
    })
  })
})
