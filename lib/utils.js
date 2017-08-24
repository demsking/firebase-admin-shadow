'use static'

const toObject = (array) => {
  const object = {}

  array.forEach((item, i) => {
    object[`${i}`] = item
  })

  return object
}

const parseData = (data) => {
  if (data instanceof Array) {
    data = toObject(data)
  } else if (typeof data !== 'object' || data === null) {
    return data
  }

  Object.keys(data).forEach((rootKey) => {
    const root = data[rootKey]

    if (typeof root === 'object' && root !== null) {
      Object.keys(root).forEach((nodeKey) => {
        if (nodeKey === '.sv') {
          data[rootKey] = new Date().toString()
        }
      })
    }
  })

  return data
}

const parsePath = (path) => {
  if (typeof path !== 'string') {
    throw new TypeError('Reference path must be a string')
  }

  if (!path) {
    throw new TypeError('Reference path must be a non empty string')
  }

  return path.trim().replace(/^[\/]+/g, '').replace(/[\/]+$/g, '')
}

module.exports = { toObject, parseData, parsePath }
