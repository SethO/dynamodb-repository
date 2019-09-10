const DynamoDB = require('aws-sdk/clients/dynamodb');
const https = require('https');
const createError = require('http-errors');
const clone = require('clone');
const validate = require('./validator');
const { createCursor, parseCursor, createId } = require('./utils');

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
  constructor({ tableName, hashKeyName, idOptions }) {
    validate.hashKeyRepoConstructor({ tableName, hashKeyName, idOptions });
    this.tableName = tableName;
    this.hashKeyName = hashKeyName;
    this.idOptions = idOptions;
    // see https://theburningmonk.com/2019/02/lambda-optimization-tip-enable-http-keep-alive/
    const sslAgent = new https.Agent({
      keepAlive: true,
      maxSockets: 50,
      rejectUnauthorized: true,
    });
    this.dynamoDb = new DynamoDB.DocumentClient({
      service: new DynamoDB({
        agent: sslAgent,
      }),
    });
  }

  async get(hashKey) {
    const key = { [this.hashKeyName]: hashKey };
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
    const key = { [this.hashKeyName]: hashKey };
    const deleteParams = {
      TableName: this.tableName,
      Key: key,
    };
    await this.dynamoDb.delete(deleteParams).promise();
  }

  async create(item) {
    const itemToSave = clone(item);
    itemToSave[this.hashKeyName] = createId(this.idOptions);
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
