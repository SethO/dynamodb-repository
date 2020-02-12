# dynamodb-repository
![](https://img.shields.io/npm/v/@setho/dynamodb-repository.svg)  ![](https://app.codeship.com/projects/a911ad40-03eb-0137-5493-663ef6d42e08/status?branch=master)

DynamoDB repository for hash-key and hash-key/range indexed tables. Designed for Lambda use. Handles niceties like created and updated timestamps and default id creation.

## Install
  `$ npm install @setho/dynamodb-repository --save`

## Usage
```javascript
const { HashKeyRepository } = require('@setho/dynamodb-repository');

const myRepo = new HashKeyRepository({ 
  tableName: 'Items', // Required
  hashKeyName: 'id',  // Required
  idOptions: {        // Optional
    length: 22,       // Default is 22
    prefix: 'itm_',   // Default is empty string
  },
  documentClient,     // Optional
});
```
#### Constructor
Use the optional `idOptions` constructor parameter to set `id` length and an optional `prefix` to give your ids some human-readable context. The prefix length is added to the length specified. E.g., if you ask for a `length` of 22 and a `prefix` of 'itm_', all your ids will be strings of length 26.

Additionally, you can inject your own DocumentClient if you are using a wrapped client (e.g., [Dazn's powertools dynamodb client](https://github.com/getndazn/dazn-lambda-powertools/tree/master/packages/lambda-powertools-dynamodb-client)).

#### Environment Variables
This library takes advantage of AWS SDK connection reuse *if* you set environment variable `AWS_NODEJS_CONNECTION_REUSE_ENABLED` to 1. This was enabled by the AWS SDK in [release 2.463.0](https://github.com/aws/aws-sdk-js/blob/master/CHANGELOG.md#24630). This can give a [3x speed improvement](https://theburningmonk.com/2019/02/lambda-optimization-tip-enable-http-keep-alive/) per call - I highly recommend setting this variable in your application.

## Create
- Requires action `dynamodb:PutItem`
- Automatically adds a string key (this will overwrite any you may try to provide). Use constructor options to specify length and optional prefix.
- Automatically provides a `createdAt` and `updatedAt` timestamp in ISO-8601
- Returns what was saved; does not mutate the item passed in.
```javascript
const mySavedItem = await myRepo.create(myItem);
mySavedItem.id  // itm_a4d02890b7174730b4bbbc
mySavedItem.createdAt  // 1979-11-04T09:00:00.000Z
mySavedItem.updatedAt  // 1979-11-04T09:00:00.000Z
```

## Get by Key
- Requires action `dynamodb:GetItem`.
- Throws `404` if item not found using [http-errors](https://npmjs.com/package/http-errors).
```javascript
const myItem = await myRepo.get(id);
```

## Get Many
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

## Remove by Key
- Requires action `dynamodb:DeleteItem`
```javascript
await myRepo.remove(id);
```

  // More Coming Soon...