# dynamodb-repository
![](https://img.shields.io/npm/v/@setho/dynamodb-repository.svg)  ![](https://app.codeship.com/projects/a911ad40-03eb-0137-5493-663ef6d42e08/status?branch=master)

DynamoDB repository for hash-key and hash-key/range indexed tables. Designed for Lambda use. Handles nicities like created and updated timestamps and default id creation.

## Install
  $ npm install @setho/dynamodb-repository

## Usage
  ```javascript
  const { HashKeyRepository } = require('@setho/dynamodb-repository');

  const myRepo = new HashKeyRepository({ tableName: 'Items', hashKeyName: 'itemId' });
  ```

  // More Coming Soon...