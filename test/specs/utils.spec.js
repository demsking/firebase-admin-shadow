'use strict'

const assert = require('assert')
const utils = require('../../lib/utils')
const { extension } = require('../../lib/database')

/* global describe it */

describe('Utils', () => {
  describe('toObject()', () => {
    it('should successfully convert array to JSON', () => {
      const array = [1, 'yes', null, true]
      const object = utils.toObject(array)
      const keys = Object.keys(object)

      assert.equal(keys.length, array.length)

      keys.forEach((key, i) => assert.equal(object[key], array[i]))
    })
  })

  describe('parseData()', () => {
    it('should successfully parse scalar data', () => {
      [1, 'yes', null, true].forEach((data) => {
        const parsedData = utils.parseData(data)

        assert.equal(parsedData, data)
      })
    })

    it('should successfully parse an array data', () => {
      const array = [1, 'yes', null, true]
      const parsedData = utils.parseData([1, 'yes', null, true])
      const keys = Object.keys(parsedData)

      assert.equal(keys.length, array.length)

      keys.forEach((key, i) => assert.equal(parsedData[key], array[i]))
    })

    it('should successfully parse an object data', () => {
      const object = utils.toObject([1, 'yes', null, true])
      const parsedData = utils.parseData(object)
      const keys = Object.keys(parsedData)

      keys.forEach((key) => assert.equal(parsedData[key], object[key]))
    })

    it('should successfully parse an object with ServerValue.TIMESTAMP', () => {
      const object = {
        date: extension.ServerValue.TIMESTAMP,
        x: { y: true }
      }
      const parsedData = utils.parseData(object)

      assert.ok(!isNaN(Date.parse(parsedData.date)))
    })
  })

  describe('parsePath()', () => {
    it('should successfully trim starting slash', () => {
      const path = ' /hello/world'
      const parsedPath = utils.parsePath(path)

      assert.equal(parsedPath, 'hello/world')
    })

    it('should successfully trim ending slash', () => {
      const path = 'hello/world/ '
      const parsedPath = utils.parsePath(path)

      assert.equal(parsedPath, 'hello/world')
    })

    it('should successfully trim both starting and ending slash', () => {
      const path = ' //hello/world/ '
      const parsedPath = utils.parsePath(path)

      assert.equal(parsedPath, 'hello/world')
    })

    it('should failed to parse a non string path', () => {
      const path = undefined

      assert.throws(() => utils.parsePath(path), /Reference path must be a string/)
    })

    it('should failed to parse an empty string path', () => {
      const path = ''

      assert.throws(() => utils.parsePath(path), /Reference path must be a non empty string/)
    })
  })
})
