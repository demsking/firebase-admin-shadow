'use strict'

const fs = require('fs')
const path = require('path')
const sinon = require('sinon')

let parentDir = null

const setParent = (root) => {
  parentDir = root.paths.find((item) => {
    try {
      fs.accessSync(item)
      return true
    } catch (err) {}

    return false
  })
}

const parentmodule = (name) => require(path.join(parentDir, name))

const stubFirebaseInitializeApp = () => {
  const admin = parentmodule('firebase-admin')

  sinon.stub(admin, 'initializeApp')

  const functions = parentmodule('firebase-functions')

  sinon.stub(functions, 'config').returns({
    firebase: {
      databaseURL: 'https://not-a-project.firebaseio.com',
      storageBucket: 'not-a-project.appspot.com'
    }
  })
}

const registerAuthService = () => {
  const firebase = parentmodule('firebase-admin/lib/default-namespace')
  const auth = parentmodule('firebase-admin/lib/auth/register-auth')
  const factory = require('./auth')

  auth.default = () => {
    return firebase.INTERNAL.registerService('auth', factory.service, factory.extension, factory.appHook)
  }

  parentmodule('firebase-admin/lib/firebase-app.js')
    .FirebaseApp.prototype.auth = () => {}
}

const stubDatabaseService = (firebase) => {
  const admin = parentmodule('firebase-admin')
  const factory = require('./database')

  admin.database = factory.service

  for (let key in factory.extension) {
    admin.database[key] = factory.extension[key]
  }
}

const shadow = (root) => {
  setParent(root)

  registerAuthService()
  stubFirebaseInitializeApp()
  stubDatabaseService()
}

module.exports = { parentmodule, shadow }
