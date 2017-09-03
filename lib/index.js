'use strict'

const fs = require('fs')
const path = require('path')

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

var appHook = function (event, app) {
  if (event === 'create') {
    // Initializes auth so listeners and getToken() functions are available to other services immediately.
    app.auth()
  }
}

const registerAuth = (firebase) => {
  const auth = require('./auth')

  // Register the auth mock service
  firebase.INTERNAL.registerService('auth', auth.service, auth.extension, appHook)
}

const registerDatabase = (firebase) => {
  const database = require('./database')

  // Register the database mock service
  firebase.INTERNAL.registerService('database', database.service, database.extension)
}

const shadow = (root) => {
  setParent(root)

  // Load firebase-admin from parent dir
  const firebase = parentmodule('firebase-admin/lib/default-namespace')

  // Catching original service register
  const originalServiceRegister = firebase.INTERNAL.registerService
  firebase.INTERNAL.registerService = () => {}

  parentmodule('firebase-admin/lib/auth/register-auth')
  parentmodule('firebase-admin')
  parentmodule('firebase-admin/lib/database/database')

  // Restore original service register
  firebase.INTERNAL.registerService = originalServiceRegister

  registerAuth(firebase)
  registerDatabase(firebase)
}

module.exports = { parentmodule, shadow }
