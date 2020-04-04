const DynamoDB = require('aws-sdk/clients/dynamodb');
const { BadRequest, NotFound, Conflict } = require('http-errors');
const validate = require('./validator');
const { createCursor, parseCursor, createId } = require('./utils');

const setRepositoryModifiedProperties = ({ item }) => {
  const returnItem = { ...item };
  returnItem.updatedAt = (new Date()).toISOString();
  returnItem.revision = item.revision + 1;

  return returnItem;
};

const validateHashKeyPropertyExists = ({ item, keyName }) => {
  if (!item[keyName]) {
    throw BadRequest();
  }
};

module.exports = class HashRepository {
  /**
   * Create a HashKey Repository
   * @param {Object} param - The constructor parameter
   * @param {string} param.tableName - The name of your DynamoDB table
   * @param {string} param.keyName - The name of your Hash/Partition Key property
   * @param {Object} [param.idOptions] - The idOptions parameter
   * @param {number} [param.idOptions.length=22] - The length of the random bits of the generated id
   * @param {string} [param.idOptions.prefix=] - The prefix of your id
   * @param {Object} [param.documentClient] - Injectable AWS.DynamoDB.DocumentClient
   */
  constructor({
    tableName,
    keyName,
    idOptions,
    documentClient = new DynamoDB.DocumentClient(),
  }) {
    validate.keyValueRepoConstructor({ tableName, keyName, idOptions });
    this.tableName = tableName;
    this.keyName = keyName;
    this.idOptions = idOptions;
    this.dynamoDb = documentClient;
  }

  async get(hashKey) {
    const key = { [this.keyName]: hashKey };
    const getParams = {
      TableName: this.tableName,
      Key: key,
    };
    const result = await this.dynamoDb.get(getParams).promise();
    if (!result.Item) {
      const message = `No ${this.keyName} found for ${hashKey}`;
      throw NotFound(message);
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
        throw new BadRequest('cursor is not valid');
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
    const key = { [this.keyName]: hashKey };
    const deleteParams = {
      TableName: this.tableName,
      Key: key,
    };
    await this.dynamoDb.delete(deleteParams).promise();
  }

  async create(item) {
    const itemToSave = { ...item };
    itemToSave[this.keyName] = await createId(this.idOptions);
    const isoString = (new Date()).toISOString();
    itemToSave.createdAt = isoString;
    itemToSave.updatedAt = isoString;
    itemToSave.revision = 1;

    const putParams = {
      TableName: this.tableName,
      Item: itemToSave,
    };
    await this.dynamoDb.put(putParams).promise();

    return itemToSave;
  }

  async update(item) {
    validateHashKeyPropertyExists({ item, keyName: this.keyName });
    const itemToSave = setRepositoryModifiedProperties({ item });
    const putParams = {
      TableName: this.tableName,
      Item: itemToSave,
      ConditionExpression: 'attribute_exists(#key) AND revision = :prevRev AND createdAt = :createdAt',
      ExpressionAttributeNames: {
        '#key': this.keyName,
      },
      ExpressionAttributeValues: {
        ':prevRev': itemToSave.revision - 1,
        ':createdAt': itemToSave.createdAt,
      },
    };
    try {
      await this.dynamoDb.put(putParams).promise();
    } catch (err) {
      if (err.code === 'ConditionalCheckFailedException') {
        await this.get(item[this.keyName]);
        throw Conflict();
      }
      throw err;
    }

    return itemToSave;
  }
};
