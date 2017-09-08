'use strict'

const assert = require('assert')
const { Reference } = require('../../../lib/database/Reference')
const { DataSnapshot } = require('../../../lib/database/DataSnapshot')

/* global describe it beforeEach */

describe('DataSnapshot', () => {
  beforeEach(() => {
    Reference.clear()
  })

  const key = 'key'
  const ref = new Reference({ key })

  describe('constructor()', () => {
    it('should successfully instanciate an object', () => {
      const snapshot = new DataSnapshot({ key, ref })

      assert.equal(snapshot.key, key)
      assert.ok(snapshot.ref)
      assert.equal(snapshot.value, null)
    })
  })

  describe('set()', () => {
    it('should successfully set a value', () => {
      const snapshot = new DataSnapshot({ key, ref })
      const data = 'hello'

      snapshot.data = data

      assert.equal(snapshot.value, data)
    })
  })

  describe('val()', () => {
    it('should successfully return the value with val()', () => {
      const snapshot = new DataSnapshot({ key, ref })
      const data = { name: 'Shaka' }

      snapshot.data = data

      assert.deepEqual(snapshot.val(), data)
    })
  })

  describe('push()', () => {
    it('should successfully push value on empty snapshot', () => {
      const snapshot = new DataSnapshot({ key, ref })
      const pushData = { lastname: 'Zulu' }

      assert.equal(snapshot.exists(), false)

      snapshot.push = pushData

      assert.equal(snapshot.exists(), true)
      assert.deepEqual(snapshot.value, pushData)
    })

    it('should successfully push a new value', () => {
      const snapshot = new DataSnapshot({ key, ref })
      const initialData = { firstname: 'Shaka' }
      const pushData = { lastname: 'Zulu' }

      snapshot.data = initialData
      snapshot.push = pushData

      assert.deepEqual(snapshot.value, Object.assign({}, initialData, pushData))
    })
  })

  describe('child()', () => {
    it('should successfully return a new child', () => {
      const key = 'hero'
      const value = { firstname: 'Shaka', lastname: 'Zulu' }
      const ref = Reference.get(key)

      ref.set(value)

      const childKey = 'lastname'
      const child = ref.snapshot.child(childKey)

      assert.equal(child.value, value[childKey])
    })
  })

  describe('exportVal()', () => {
    it('should successfully export snapshot value', () => {
      const key = 'hero'
      const value = { firstname: 'Shaka', lastname: 'Zulu' }
      const snapshot = new DataSnapshot({ key, ref, value })
      const exportedValue = snapshot.exportVal()

      assert.deepEqual(exportedValue, value)
    })
  })

  describe('forEach()', () => {
    it('should successfully iterate inner the snapshot', () => {
      const key = 'hero'
      const value = { firstname: 'Shaka', lastname: 'Zulu' }
      const ref = Reference.get(key)

      ref.set(value).then(() => {
        ref.snapshot.forEach((snapshot) => {
          const childKey = snapshot.key.split(/\//)[1]

          assert.deepEqual(snapshot.val(), value[childKey])
        })
      })
    })

    it('should successfully iterate inner the empty snapshot', (done) => {
      const key = 'nonexistent'
      const ref = Reference.get(key)

      ref.snapshot.forEach((snapshot) => {
        done(new Error())
      })

      done()
    })
  })

  describe('hasChild()', () => {
    it('should successfully found children', () => {
      const key = 'hero'
      const value = { firstname: 'Shaka', lastname: 'Zulu' }
      const ref = Reference.get(key)

      return ref.set(value).then(() => {
        Object.keys(value).forEach((key) => {
          assert.ok(ref.snapshot.hasChild(key))
        })
      })
    })

    it('should failed to found nonexistent child', () => {
      const key = 'hero'
      const value = { firstname: 'Shaka', lastname: 'Zulu' }
      const ref = Reference.get(key)

      return ref.set(value).then(() => {
        assert.equal(ref.snapshot.hasChild('nonexistent'), false)
      })
    })
  })

  describe('numChildren()', () => {
    it('should successfully return number of children', () => {
      const key = 'hero'
      const value = { firstname: 'Shaka', lastname: 'Zulu' }
      const ref = Reference.get(key)

      return ref.set(value).then(() => {
        assert.equal(ref.snapshot.numChildren(), Object.keys(value).length)

        ref.snapshot.forEach((snapshotChild) => {
          assert.equal(snapshotChild.numChildren(), 0)
        })
      })
    })
  })

  describe('hasChildren()', () => {
    it('should successfully return expected value', () => {
      const key = 'hero'
      const value = { firstname: 'Shaka', lastname: 'Zulu' }
      const ref = Reference.get(key)

      return ref.set(value).then(() => {
        assert.equal(ref.snapshot.hasChildren(), true)

        ref.snapshot.forEach((snapshotChild) => {
          assert.equal(snapshotChild.numChildren(), false)
        })
      })
    })
  })

  describe('toJSON()', () => {
    it('should successfully export snapshot value', () => {
      const key = 'hero'
      const value = { firstname: 'Shaka', lastname: 'Zulu' }
      const snapshot = new DataSnapshot({ key, ref, value })
      const exportedValue = snapshot.toJSON()

      assert.deepEqual(exportedValue, value)
    })
  })
})
