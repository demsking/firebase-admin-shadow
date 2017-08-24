'use strict'

const fs = require('fs')
const path = require('path')
const database = require('./database')

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

const shadow = (root) => {
  setParent(root)

  // Load firebase-admin from parent dir
  const firebase = parentmodule('firebase-admin/lib/default-namespace')

  // Catching original service register
  const originalServiceRegister = firebase.INTERNAL.registerService
  firebase.INTERNAL.registerService = () => {}

  parentmodule('firebase-admin/lib/database/database')

  // Restore original service register
  firebase.INTERNAL.registerService = originalServiceRegister

  // Register the database mock service
  firebase.INTERNAL.registerService('database', database.service, database.extension)
}

module.exports = { parentmodule, shadow }
