# Firebase Admin Shadow Mock
A basic Firebase Admin Mock library for NodeJS

## Install

```sh
npm install --save-dev firebase-admin-shadow
```

## Usage

```js
// Import firebase-admin-shadow before your logic module
const admin = require('firebase-admin-shadow')
const assert = require('assert')

// Import mock data if necessary
const mockData = require('./data.mock.json')
admin.database.import(mockData)

// Then inport your api
const api = require('../lib/api')

// now you can test your api
```

## Supported features

- [ ] Auth
- [x] Realtime Database
	- Missing `child_moved` events
	- Missing an implementation for priorities
	- Missing implementaton of Query
- [ ] Messaging
- [ ] Storage

## License

Under the MIT license. See [LICENSE](https://github.com/demsking/firebase-admin-shadow/blob/master/LICENSE) file for more details.
