const { BadRequest, NotFound, Conflict } = require('http-errors');
const { DeleteCommand, GetCommand, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const validate = require('./validator');
const { createCursor, parseCursor, createId } = require('./utils');

module.exports = class HashRepository {
  /**
   * Create a HashKey Repository
   * @param {Object} param - The constructor parameter
   * @param {string} param.tableName - The name of your DynamoDB table
   * @param {string} param.keyName - The name of your Hash/Partition Key property
   * @param {Object} param.documentClient - Injectable DynamoDBDocumentClient (v3) from @aws-sdk/lib-dynamodb
   * @param {Object} [param.idOptions] - The idOptions parameter
   * @param {number} [param.idOptions.length=22] - The length of the random bits of the generated id
   * @param {string} [param.idOptions.prefix=] - The prefix of your id
   */
  constructor({ tableName, keyName, idOptions, documentClient }) {
    validate.keyValueRepoConstructor({ tableName, keyName, idOptions, documentClient });
    this.tableName = tableName;
    this.keyName = keyName;
    this.idOptions = idOptions;
    this.docClient = documentClient;
  }

  async get(hashKey) {
    const key = { [this.keyName]: hashKey };
    const getParams = {
      TableName: this.tableName,
      Key: key,
    };
    const { Item } = await this.docClient.send(new GetCommand(getParams));
    if (!Item) {
      const message = `No ${this.keyName} found for ${hashKey}`;
      throw NotFound(message);
    }

    return Item;
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
      result = await this.docClient.send(new ScanCommand(scanParams));
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
    await this.docClient.send(new DeleteCommand(deleteParams));
  }

  async create(item) {
    const itemToSave = { ...item };
    itemToSave[this.keyName] = await createId(this.idOptions);
    const isoString = new Date().toISOString();
    itemToSave.createdAt = isoString;
    itemToSave.updatedAt = isoString;
    itemToSave.revision = 1;

    const putParams = {
      TableName: this.tableName,
      Item: itemToSave,
    };
    await this.docClient.send(new PutCommand(putParams));

    return itemToSave;
  }

  async update(item) {
    validateHashKeyPropertyExists({ item, keyName: this.keyName });
    const itemToSave = setRepositoryModifiedProperties({ item });
    const { revision: previousRevision } = item;
    const putParams = {
      TableName: this.tableName,
      Item: itemToSave,
      ConditionExpression: 'attribute_exists(#key) AND revision = :prevRev',
      ExpressionAttributeNames: {
        '#key': this.keyName,
      },
      ExpressionAttributeValues: {
        ':prevRev': previousRevision,
      },
    };
    try {
      await this.docClient.send(new PutCommand(putParams));
    } catch (err) {
      if (err.name === 'ConditionalCheckFailedException') {
        await this.get(item[this.keyName]);
        throw Conflict();
      }
      throw err;
    }

    return itemToSave;
  }
};

const validateHashKeyPropertyExists = ({ item, keyName }) => {
  if (!item[keyName]) {
    throw new BadRequest();
  }
};

const setRepositoryModifiedProperties = ({ item }) => {
  const returnItem = { ...item };
  returnItem.updatedAt = new Date().toISOString();
  returnItem.revision = item.revision + 1;

  return returnItem;
};
