'use static'

const db = { users: {} }

/**
 * @ref https://jsfiddle.net/briguy37/2MVFd/
 */
const generateUUID = () => {
  let d = new Date().getTime()

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      var r = (d + Math.random()*16)%16 | 0
      d = Math.floor(d/16)
      return (c=='x' ? r : (r&0x3|0x8)).toString(16)
  })
}

const unCamelCase = (name) => {
  return name.split('').reduce((array, letter) => {
    if (letter === letter.toUpperCase()) {
      array.push('-')
    }

    array.push(letter.toLowerCase())

    return array
  }, []).join('')
}

const checkIfUniqueKeyExists = (record, property) => {
  if (!record.hasOwnProperty(property)) {
    return
  }

  const uidMatched = Object.keys(db.users).find((uid) => {
    return db.users[uid][property] === record[property]
  })

  if (uidMatched) {
    const error = new Error(`The provided ${property} is already in use by an existing user`)

    error.code = `auth/${unCamelCase(property)}-alread-exists`

    throw error
  }
}

const unexistentError = () => {
  const error = new Error('There is no existing user record corresponding to the provided identifier')

  error.code = 'auth/user-not-found'

  return error
}

const getUserByProperty = (property, value) => {
  const uid = Object.keys(db.users).find((uid) => {
    return db.users[uid][property] === value
  })

  if (!uid) {
    return Promise.reject(unexistentError())
  }

  return Promise.resolve(db.users[uid])
}

const uniqueProperties = ['uid', 'email', 'phoneNumber']

const service = () => ({
  createCustomToken (uid, developerClaims) {
    return {
      accessToken: 'result.access_token',
      expirationTime: Date.now() + 50000
    }
  },

  createUser (properties) {
    const record = Object.assign({}, properties)

    for (let property of uniqueProperties) {
      try {
        checkIfUniqueKeyExists(record, property)
      } catch (err) {
        return Promise.reject(err)
      }
    }

    if (!record.hasOwnProperty('uid')) {
      record.uid = generateUUID()
    }

    db.users[record.uid] = record

    return Promise.resolve(record)
  },

  getUser (uid) {
    if (!db.users.hasOwnProperty(uid)) {
      return Promise.reject(unexistentError())
    }

    return Promise.resolve(db.users[uid])
  },

  getUserByEmail (email) {
    return getUserByProperty('email', email)
  },

  getUserByPhoneNumber (phoneNumber) {
    return getUserByProperty('phoneNumber', phoneNumber)
  },

  updateUser (uid, updatedProperties) {
    return this.getUser(uid).then((record) => {
      for (let property in updatedProperties) {
        record[property] = updatedProperties[property]
      }

      return record
    })
  },

  deleteUser (uid) {
    delete db.users[uid]

    return Promise.resolve()
  }
})

const extension = {
  import (data) {
    db.users = data
  },
  clear () {
    db.users = {}
  }
}

module.exports = {
  generateUUID,
  unCamelCase,
  checkIfUniqueKeyExists,
  getUserByProperty,
  service,
  extension,
  db
}
