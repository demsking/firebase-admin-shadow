'use static'

const { Reference } = require('./Reference')
const DataSnapshot = require('./DataSnapshot')

// Setting ReferenceInterface reference
// on DataSnapshot to resolve cycling
DataSnapshot.ReferenceInterface.get = Reference.get

const service = (app) => ({
  ref (key) {
    return Reference.get(key, app)
  }
})

const extension = {
  ServerValue: {
    TIMESTAMP: {
      '.sv': 'timestamp'
    }
  },
  import (data) {
    const database = this

    Object.keys(data).forEach((rootKey) => {
      database().ref(rootKey).set(data[rootKey])
    })
  },
  clear () {
    Reference.clear()
  }
}

module.exports = { service, extension }
