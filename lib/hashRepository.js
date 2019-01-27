const AWS = require('aws-sdk');
const validate = require('./validator');

module.exports = class HashRepository {
  constructor({ tableName, hashKeyName }) {
    validate.hashKeyRepoConstructor({ tableName, hashKeyName });
    this.tableName = tableName;
    this.hashKeyName = hashKeyName;
    this.dynamoDb = new AWS.DynamoDB.DocumentClient();
  }

  async get(hashKey) {
    const key = {};
    key[this.hashKeyName] = hashKey;
    const getParams = {
      TableName: this.tableName,
      Key: key,
    };
    await this.dynamoDb.get(getParams).promise();
  }
};
