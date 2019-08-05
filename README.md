# dynamodb-repository
![](https://img.shields.io/npm/v/@setho/dynamodb-repository.svg)  ![](https://app.codeship.com/projects/a911ad40-03eb-0137-5493-663ef6d42e08/status?branch=master)

DynamoDB repository for hash-key and hash-key/range indexed tables. Designed for Lambda use. Handles nicities like created and updated timestamps and default id creation.

## Install
  `$ npm install @setho/dynamodb-repository --save`

## Usage
```javascript
const { HashKeyRepository } = require('@setho/dynamodb-repository');

const myRepo = new HashKeyRepository({ tableName: 'Items', hashKeyName: 'id' });
```

### Get by Key
- Requires action `dynamodb:GetItem`.
- Throws `404` if item not found using [http-errors](https://npmjs.com/package/http-errors).
```javascript
const myItem = await myRepo(id);
```

### Get Many
- Requires action `dynamodb:Scan`
- Accepts optional parameter fields `limit` and `cursor`
- Returns object with `items` (Array) and `cursor` (String)
  - `items` will always be an array; if nothing found, it will be empty
  - `cursor` will either be present or not, depending on whether there are more items to fetch
```javascript
// Defaults to 100 at a time from the begining
const { items, cursor } = await myRepo.getMany();

// Fetch ten records at a time until finished
const allResults = [];
const {items, cursor}
let cursor = 'initialValue';
while(cursor) {
  
}
```

  // More Coming Soon...