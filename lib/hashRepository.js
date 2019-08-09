const AWS = require('aws-sdk');
const createError = require('http-errors');
const validate = require('./validator');
const { createCursor, parseCursor } = require('./utils');

const buildKey = (keyName, keyValue) => {
  const key = {};
  key[keyName] = keyValue;

  return key;
};

module.exports = class HashRepository {
  constructor({ tableName, hashKeyName }) {
    validate.hashKeyRepoConstructor({ tableName, hashKeyName });
    this.tableName = tableName;
    this.hashKeyName = hashKeyName;
    this.dynamoDb = new AWS.DynamoDB.DocumentClient();
  }

  async get(hashKey) {
    const key = buildKey(this.hashKeyName, hashKey);
    const getParams = {
      TableName: this.tableName,
      Key: key,
    };
    const result = await this.dynamoDb.get(getParams).promise();
    if (!result.Item) {
      throw createError(404, `hash key ${hashKey} not found`);
    }

    return result.Item;
  }

  async getMany({ limit = 100, cursor } = {}) {
    const scanParams = {
      TableName: this.tableName,
      Limit: limit,
    };
    if (cursor) {
      const startKey = {};
      startKey[this.hashKeyName] = parseCursor(cursor);
      scanParams.ExclusiveStartKey = startKey;
    }
    let result;
    try {
      result = await this.dynamoDb.scan(scanParams).promise();
    } catch (err) {
      if (err.code === 'ValidationException') {
        throw createError(400, 'cursor is not valid');
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
};
