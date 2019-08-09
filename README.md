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
  - `limit` defaults to 100
- Returns object with `items` (Array) and `cursor` (String)
  - `items` will always be an array; if nothing found, it will be empty
  - `cursor` will be present if there are more items to fetch, otherwise it will be undefined
```javascript
// Example to pull 100 at time until you have all items
const allItems = [];
const getAllItems = async ({ limit, cursor = null }) => {
  const getResult = await myRepo.getMany({ limit, cursor });
  allItems.push(...getResult.items);
  if (getResult.cursor) {
    await getAllItems({ cursor: getResult.cursor });
  }
};
```

### Remove by Key
- Requires action `dynamodb:DeleteItem`
```javascript
await myRepo.remove(id);
```

  // More Coming Soon...