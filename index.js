'use strict'

const lib = require('./lib')

lib.shadow(module.parent)

module.exports = lib.parentmodule('firebase-admin')
