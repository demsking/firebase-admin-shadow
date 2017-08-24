'use static'

const EventEmitter = require('events')
const { parsePath } = require('../utils')
const { DataSnapshot } = require('./DataSnapshot')
const { Query } = require('./Query')

const supportedEventNames = [
  'value', 'child_added', 'child_removed', 'child_changed'
]

let listeners = {}
let references = {}

class Reference extends Query {
  constructor ({ key, root = null, parent = null, app }) {
    super()

    Object.defineProperty(this, 'app', {
      value: app
    })

    this.key = key
    this.root = root
    this.parent = parent

    this.snapshot = new DataSnapshot({
      key: this.key,
      ref: this
    })
  }

  static get (key, app) {
    if (references.hasOwnProperty(key)) {
      return references[key]
    }

    const keys = parsePath(key).split(/\//)

    let currentRef = null
    let parentRef = null
    let rootRef = null

    for (let i = 0; i < keys.length; i++) {
      const currentKey = keys.slice(0, i + 1).join('/')

      parentRef = currentRef

      if (references.hasOwnProperty(currentKey)) {
        currentRef = references[currentKey]

        if (parentRef === null) {
          rootRef = references[currentKey]
        }

        continue
      }

      currentRef = new Reference({
        key: currentKey,
        root: rootRef,
        parent: parentRef,
        app: app
      })

      references[currentKey] = currentRef
    }

    return currentRef
  }

  static clear () {
    references = {}
    listeners = {}
  }

  child (path) {
    const key = `${this.key}/${parsePath(path)}`

    return references[key] = Reference.get(key, this.app)
  }

  static setValue (ref, value, isPush = false) {
    if (value === null) {
      ref.snapshot.data = value
      return ref.remove()
    }

    const isAnewData = ref.snapshot.val() === null

    if (isPush) {
      ref.snapshot.push = value
    } else {
      ref.snapshot.data = value
    }

    if (listeners.hasOwnProperty(ref.key)) {
      if (isAnewData) {
        listeners[ref.key].emit('child_added', ref.snapshot)
      } else {
        listeners[ref.key].emit('child_changed', ref.snapshot)
      }

      listeners[ref.key].emit('value', ref.snapshot)
    }

    if (typeof value === 'object') {
      Object.keys(value).forEach((key) => {
        const path = `${ref.key}/${key}`
        const childRef = Reference.get(path)

        Reference.setValue(childRef, value[key])
      })
    }
  }

  push (data, onComplete = null) {
    Reference.setValue(this, data, true)

    if (onComplete) {
      return onComplete(this.snapshot)
    }

    return Promise.resolve(this.snapshot)
  }

  set (data, onComplete = null) {
    Reference.setValue(this, data)

    if (onComplete) {
      return onComplete(this.snapshot)
    }

    return Promise.resolve(this.snapshot)
  }

  update (data, onComplete = null) {
    Reference.setValue(this, data)

    if (listeners.hasOwnProperty(ref.key)) {
      listeners[ref.key].emit('child_changed', ref.snapshot)
    }

    if (onComplete) {
      return onComplete(this.snapshot)
    }

    return Promise.resolve(this.snapshot)
  }

  remove (onComplete) {
    delete references[this.key]

    if (listeners.hasOwnProperty(this.key)) {
      listeners[this.key].emit('child_removed', this.snapshot)

      delete listeners[this.key]
    }

    if (onComplete) {
      return onComplete(this.snapshot)
    }

    return Promise.resolve(this.snapshot)
  }

  on (eventType, callback) {
    if (!supportedEventNames.includes(eventType)) {
      throw new Error(`Not Yet Implemented: event '${eventType}'`)
    }

    if (!listeners.hasOwnProperty(this.key)) {
      listeners[this.key] = new EventEmitter()
    }

    listeners[this.key].on(eventType, callback)

    return listeners[this.key]
  }

  once (eventType, callback) {
    if (typeof callback !== 'function' && eventType === 'value') {
      if (!this.snapshot.exists()) {
        const err = new Error()

        err.snapshot = this.snapshot

        return Promise.reject(err)
      }

      return Promise.resolve(this.snapshot)
    }

    if (!supportedEventNames.includes(eventType)) {
      throw new Error(`Not Yet Implemented: event '${eventType}'`)
    }

    if (!listeners.hasOwnProperty(this.key)) {
      listeners[this.key] = new EventEmitter()
    }

    return listeners[this.key].once(eventType, callback)
  }

  off (eventType, callback) {
    if (!supportedEventNames.includes(eventType)) {
      throw new Error(`Not Yet Implemented: event '${eventType}'`)
    }

    if (listeners.hasOwnProperty(this.key)) {
      listeners[this.key].removeListener(eventType, callback)

      delete listeners[this.key]
    }
  }

  toString () {
    return `https://${this.app.options.databaseURL}/${this.key}`
  }
}

module.exports = {
  Reference
}
