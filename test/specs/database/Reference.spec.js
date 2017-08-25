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

  describe('toString()', () => {
    it('should successfully generate the reference URL', () => {
      const usersRef = Reference.get('users', app)
      const adaRef = usersRef.child('ada')
      const adaFirstNameRef = adaRef.child('name/first')
      const path = adaFirstNameRef.toString()

      assert.equal(path, `https://${app.options.databaseURL}/users/ada/name/first`)
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

  describe('setValue()', () => {
    it('should successfully set null data', () => {
      const usersRef = Reference.get('users', app)

      return Reference.setValue(usersRef, null)
        .then((snapshot) => {
          assert.equal(snapshot.value, null)
        })
    })

    it('should successfully set data', () => {
      const usersRef = Reference.get('users', app)
      const data = { ada: { name: { first: 'Anna' } } }

      Reference.setValue(usersRef, data)

      assert.deepEqual(usersRef.snapshot.value, data)
    })

    it('should successfully push new data', () => {
      const usersRef = Reference.get('users', app)
      const initialData = { ada: { name: { last: 'Ada' } } }
      const pushData = { ada: { name: { first: 'Anna' } } }
      const expectedData = Object.assign({}, initialData, pushData)

      Reference.setValue(usersRef, initialData)
      Reference.setValue(usersRef, pushData, true)

      assert.deepEqual(usersRef.snapshot.value, expectedData)
    })

    it('should successfully push data as initial data', () => {
      const usersRef = Reference.get('users', app)
      const data = { ada: { name: { first: 'Anna' } } }

      Reference.setValue(usersRef, data, true)

      assert.deepEqual(usersRef.snapshot.value, data)
    })

    it('should successfully handle child_added event', (done) => {
      const usersRef = Reference.get('users', app)
      const data = { ada: { name: { first: 'Anna' } } }

      usersRef.once('child_added', (snapshot) => {
        assert.deepEqual(snapshot.value, data)
        done()
      })

      Reference.setValue(usersRef, data)
    })

    it('should successfully handle child_changed event', (done) => {
      const usersRef = Reference.get('users', app)
      const initialData = { ada: { name: { last: 'Ada' } } }
      const pushData = { ada: { name: { first: 'Anna' } } }
      const expectedData = Object.assign({}, initialData, pushData)

      usersRef.once('child_changed', (snapshot) => {
        assert.deepEqual(snapshot.value, expectedData)
        done()
      })

      Reference.setValue(usersRef, initialData)
      Reference.setValue(usersRef, pushData, true)
    })

    it('should successfully handle value event', (done) => {
      const usersRef = Reference.get('users', app)
      const data = { ada: { name: { first: 'Anna' } } }

      usersRef.once('value', (snapshot) => {
        assert.deepEqual(snapshot.value, data)
        done()
      })

      Reference.setValue(usersRef, data)
    })
  })

  describe('set()', () => {
    it('should successfully set data using callback', () => {
      const usersRef = Reference.get('users', app)
      const data = { ada: { name: { first: 'Anna' } } }

      return usersRef.set(data, (snapshot) => {
        assert.deepEqual(snapshot.value, data)
      })
    })

    it('should successfully set data using promise', () => {
      const usersRef = Reference.get('users', app)
      const data = { ada: { name: { first: 'Anna' } } }

      return usersRef.set(data).then((snapshot) => {
        assert.deepEqual(snapshot.value, data)
      })
    })
  })

  describe('push()', () => {
    it('should successfully push new data using callback', () => {
      const usersRef = Reference.get('users', app)
      const initialData = { ada: { name: { last: 'Ada' } } }
      const pushData = { ada: { name: { first: 'Anna' } } }
      const expectedData = Object.assign({}, initialData, pushData)

      usersRef.set(initialData)

      return usersRef.push(pushData, (snapshot) => {
        assert.deepEqual(snapshot.value, expectedData)
      })
    })

    it('should successfully push new data using promise', () => {
      const usersRef = Reference.get('users', app)
      const initialData = { ada: { name: { last: 'Ada' } } }
      const pushData = { ada: { name: { first: 'Anna' } } }
      const expectedData = Object.assign({}, initialData, pushData)

      usersRef.set(initialData)

      return usersRef.push(expectedData).then((snapshot) => {
        assert.deepEqual(snapshot.value, expectedData)
      })
    })

    it('should successfully push data as initial data', () => {
      const usersRef = Reference.get('users', app)
      const data = { ada: { name: { first: 'Anna' } } }

      return usersRef.push(data, (snapshot) => {
        assert.deepEqual(snapshot.value, data)
      })
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
