const DynamoDB = require('aws-sdk/clients/dynamodb');
const createError = require('http-errors');
const clone = require('clone');
const uuidv4 = require('uuid/v4');
const validate = require('./validator');
const { createCursor, parseCursor } = require('./utils');

const buildKey = (keyName, keyValue) => {
  const key = {};
  key[keyName] = keyValue;

  return key;
};

const setRepositoryControlledProperties = ({ originalItem, updatedItem }) => {
  const returnItem = clone(updatedItem);
  returnItem.createdAt = originalItem.createdAt;
  returnItem.updatedAt = (new Date()).toISOString();

  return returnItem;
};

const validateHashKeyPropertyExists = ({ item, hashKeyName }) => {
  if (!item[hashKeyName]) {
    throw createError.BadRequest();
  }
};

module.exports = class HashRepository {
  constructor({ tableName, hashKeyName }) {
    validate.hashKeyRepoConstructor({ tableName, hashKeyName });
    this.tableName = tableName;
    this.hashKeyName = hashKeyName;
    this.dynamoDb = new DynamoDB.DocumentClient();
  }

  async get(hashKey) {
    const key = buildKey(this.hashKeyName, hashKey);
    const getParams = {
      TableName: this.tableName,
      Key: key,
    };
    const result = await this.dynamoDb.get(getParams).promise();
    if (!result.Item) {
      const message = `No ${this.hashKeyName} found for ${hashKey}`;
      throw createError.NotFound(message);
    }

    return result.Item;
  }

  async getMany({ limit = 100, cursor } = {}) {
    const scanParams = {
      TableName: this.tableName,
      Limit: limit,
    };
    if (cursor) {
      scanParams.ExclusiveStartKey = parseCursor(cursor);
    }
    let result;
    try {
      result = await this.dynamoDb.scan(scanParams).promise();
    } catch (err) {
      if (err.code === 'ValidationException') {
        throw createError.BadRequest('cursor is not valid');
      }
      throw err;
    }
    const returnCursor = result.LastEvaluatedKey
      ? createCursor(result.LastEvaluatedKey)
      : undefined;

    return {
      items: result.Items,
      cursor: returnCursor,
    };
  }

  async remove(hashKey) {
    const key = buildKey(this.hashKeyName, hashKey);
    const deleteParams = {
      TableName: this.tableName,
      Key: key,
    };
    await this.dynamoDb.delete(deleteParams).promise();
  }

  async create(item) {
    const itemToSave = clone(item);
    itemToSave[this.hashKeyName] = uuidv4().replace(/-/g, '');
    const isoString = (new Date()).toISOString();
    itemToSave.createdAt = isoString;
    itemToSave.updatedAt = isoString;

    const putParams = {
      TableName: this.tableName,
      Item: itemToSave,
    };
    await this.dynamoDb.put(putParams).promise();
    
    return itemToSave;
  }

  async update(item) {
    validateHashKeyPropertyExists({ item, hashKeyName: this.hashKeyName });
    const originalItem = await this.get(item[this.hashKeyName]);
    const itemToSave = setRepositoryControlledProperties({ originalItem, updatedItem: item });
    const putParams = {
      TableName: this.tableName,
      Item: itemToSave,
    };
    await this.dynamoDb.put(putParams).promise();

    return itemToSave;
  }
};
