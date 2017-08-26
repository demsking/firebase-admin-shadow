'use static'

const { parsePath } = require('../utils')

class Query {
  constructor () {
    this.query = null
    this.orderType = null
  }

  endAt (value, key) {
    if (this.orderType === 'key') {
      if (typeof value !== 'string') {
        throw new TypeError('Value must be a string')
      }
    }

    if (!this.snapshot.value) {
      return this
    }

    Object.keys(this.snapshot.value).reduce((result, item) => {
      switch (this.orderType) {
        case 'key':
            if (item === value) {
              return result.concat([this.snapshot.value[item]])
            }
          break

        default:
          return result
      }
    }, [])
    return this
  }

  equalTo (value, key) {
    console.warn('Reference.equalTo() is not yet implemented')
    return this
  }

  isEqual (other) {
    console.warn('Reference.isEqual() is not yet implemented')
    return this
  }

  limitToFirst (limit) {
    console.warn('Reference.limitToFirst() is not yet implemented')
    return this
  }

  limitToLast (limit) {
    console.warn('Reference.limitToLast() is not yet implemented')
    return this
  }

  orderByChild (path) {
    const child = this.child(path)

    child.orderType = 'child'

    return child
  }

  orderByKey () {
    this.orderType = 'key'

    return this
  }

  orderByPriority (path) {
    console.warn('Reference.orderByPriority() is not yet implemented')
    return this
  }

  orderByValue (path) {
    const child = this.child(path)

    child.orderType = 'child'

    return child
  }

  startAt (value, key) {
    console.warn('Reference.startAt() is not yet implemented')
    return this
  }

  toJSON () {
    //
  }
}

module.exports = { Query }
