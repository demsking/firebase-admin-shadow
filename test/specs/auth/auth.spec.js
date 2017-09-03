'use strict'

const assert = require('assert')
const {
  generateUUID,
  unCamelCase,
  checkIfUniqueKeyExists,
  getUserByProperty,
  service,
  extension,
  db
} = require('../../../lib/auth')

/* global describe it */

describe('Auth Service', () => {
  describe('Service Instance', () => {
    it('should successfully create a auth instance', () => {
      const ExpectedApi = [
        'createCustomToken', 'getUser', 'getUserByEmail',
        'getUserByPhoneNumber', 'createUser', 'deleteUser', 'updateUser'
      ]
      const api = service()

      ExpectedApi.forEach((name) => {
        assert.ok(api.hasOwnProperty(name), `Missing API '${name}' entry`)
      })
    })
  })

  const properties = {
    email: 'user@example.com',
    emailVerified: false,
    phoneNumber: '+11234567890',
    password: 'secretPassword',
    displayName: 'John Doe',
    photoURL: 'http://www.example.com/12345678/photo.png',
    disabled: false
  }

  describe('Service Extension', () => {
    describe('extension.import()', () => {
      it('should successfully import users list', () => {
        const data = { x: properties, y: properties }

        extension.import(data)

        assert.deepEqual(data, db.users)
      })
    })

    describe('extension.clear()', () => {
      it('should successfully clear users list', () => {
        db.users = { x: properties, y: properties }

        extension.clear()

        assert.deepEqual(db.users, {})
      })
    })
  })

  describe('Service Utils', () => {
    describe('generateUUID()', () => {
      it('should successfully generate new UID', () => {
        assert.equal(typeof generateUUID(), 'string')
      })
    })

    describe('unCamelCase()', () => {
      it('should successfully parse camel name', () => {
        assert.equal(unCamelCase('firstName'), 'first-name')
      })
    })

    describe('checkIfUniqueKeyExists()', () => {
      it('should successfully throw with already existing property', () => {
        db.users = { x: { email: properties.email } }

        assert.throws(() => {
          checkIfUniqueKeyExists(properties, 'email')
        }, /The provided email is already/)
      })

      it('should successfully does not throws with unique property', () => {
        db.users = {}

        assert.doesNotThrow(() => {
          checkIfUniqueKeyExists(properties, 'email')
        })
      })
    })

    describe('getUserByProperty()', () => {
      beforeEach(() => {
        extension.clear()
      })

      it('should failed to retrieve with an un-existent email', () => {
        return getUserByProperty('email', properties.email)
          .then((userRecord) => {
            throw new Error('Should failed with a non-existing email')
          })
          .catch((err) => Promise.resolve())
      })

      it('should successfully retrieve user with its email', () => {
        db.users = { x: { email: properties.email } }

        return getUserByProperty('email', properties.email)
      })
    })
  })

  describe('Service API', () => {
    beforeEach(() => {
      extension.clear()
    })

    describe('admin.auth().createCustomToken(uid, developerClaims)', () => {
      it('should successfully create custom token', () => {
        service().createCustomToken()
      })
    })

    describe('admin.auth().createUser(properties)', () => {
      it('should successfully create an user', () => {
        return service().createUser(properties)
          .then((userRecord) => {
            assert.equal(typeof userRecord.uid, 'string')
            assert.ok(db.users.hasOwnProperty(userRecord.uid))
            assert.deepEqual(userRecord, db.users[userRecord.uid])
          })
      })

      it('should successfully create an user with default UID', () => {
        const props = Object.assign({}, properties, { uid: 'x' })

        return service().createUser(props)
          .then((userRecord) => {
            assert.equal(userRecord.uid, props.uid)
          })
      })

      it('should failed to create an already existing user', () => {
        db.users = { x: { email: properties.email } }

        return service().createUser(properties)
          .then((userRecord) => {
            throw new Error('Should failed with existing email')
          })
          .catch((err) => Promise.resolve())
      })
    })

    describe('admin.auth().getUser(uid)', () => {
      it('should failed to retrieve with a non-existent UID', () => {
        return service().getUser(properties.email)
          .then((userRecord) => {
            throw new Error('Should failed with a non-existing email')
          })
          .catch((err) => Promise.resolve())
      })

      it('should successfully retrieve an user data using its UID', () => {
        return service().createUser(properties)
          .then((userRecord) => service().getUser(userRecord.uid))
          .then((userRecord) => {
            assert.equal(typeof userRecord.uid, 'string')
            assert.ok(db.users.hasOwnProperty(userRecord.uid))
            assert.deepEqual(userRecord, db.users[userRecord.uid])
          })
      })
    })

    describe('admin.auth().getUserByEmail(email)', () => {
      it('should successfully retrieve an user data using its email', () => {
        return service().createUser(properties)
          .then((userRecord) => {
            return service().getUserByEmail(userRecord.email)
          })
          .then((userRecord) => {
            assert.equal(typeof userRecord.uid, 'string')
            assert.ok(db.users.hasOwnProperty(userRecord.uid))
            assert.deepEqual(userRecord, db.users[userRecord.uid])
          })
      })
    })

    describe('admin.auth().getUserByPhoneNumber(email)', () => {
      it('should successfully retrieve an user data using its phone number', () => {
        return service().createUser(properties)
          .then((userRecord) => {
            return service().getUserByPhoneNumber(userRecord.phoneNumber)
          })
          .then((userRecord) => {
            assert.equal(typeof userRecord.uid, 'string')
            assert.ok(db.users.hasOwnProperty(userRecord.uid))
            assert.deepEqual(userRecord, db.users[userRecord.uid])
          })
      })
    })

    describe('admin.auth().updateUser(uid, properties)', () => {
      const uid = 'x'
      const modifiedProperties = {
        uid: uid,
        email: 'modifiedUser@example.com',
        phoneNumber: '+11234567890',
        emailVerified: true,
        password: 'newPassword',
        displayName: 'Jane Doe',
        photoURL: 'http://www.example.com/12345678/photo.png',
        disabled: true
      }

      it('should successfully update user properties', () => {
        db.users = {
          [uid]: Object.assign({}, properties, { uid })
        }

        return service().updateUser(uid, modifiedProperties)
          .then((modifiedRecord) => {
            assert.deepEqual(modifiedRecord, modifiedProperties)
          })
      })
    })

    describe('admin.auth().deleteUser(uid)', () => {
      it('should successfully delete an user using its uid', () => {
        return service().createUser(properties).then((userRecord) => {
          return service().deleteUser(userRecord.uid)
        })
      })
    })
  })
})
