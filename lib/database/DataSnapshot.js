'use static'

const { parseData, parsePath } = require('../utils')

// Reference interface. Loaded on index.js
let ReferenceInterface = { get () {} }

class DataSnapshot {
  constructor ({ key, ref, value = null }) {
    this.key = key
    this.ref = ref
    this.value = value
  }

  val () {
    return this.value
  }

  child (key) {
    const ref = ReferenceInterface.get(`${this.key}/${parsePath(key)}`)

    return ref.snapshot
  }

  exists () {
    return this.value !== null
  }

  exportVal () {
    return JSON.parse(JSON.stringify(this.value))
  }

  forEach (action) {
    if (this.value === null) {
      return
    }

    if (typeof this.value !== 'object') {
      return
    }

    Object.keys(this.value).forEach((key) => {
      action(this.child(key))
    })
  }

  hasChild (path) {
    return this.child(path).exists()
  }

  numChildren () {
    let count = 0

    this.forEach(() => count++)

    return count
  }

  hasChildren () {
    return this.numChildren() > 0
  }

  toJSON () {
    return this.exportVal()
  }

  set data (value) {
    this.value = parseData(value)
  }

  set push (value) {
    if (this.value === null) {
      this.value = {}
    }

    Object.assign(this.value, parseData(value))
  }
}

module.exports = { DataSnapshot, ReferenceInterface }
