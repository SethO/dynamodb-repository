const DynamoDB = require('aws-sdk/clients/dynamodb');

const DynamoDbConfig = {
  region: 'us-east-1',
};

let client;

const getDynamoDbClient = (config = DynamoDbConfig) => {
  if (!client) {
    client = new DynamoDB.DocumentClient(config);
  }

  return client;
};

module.exports = getDynamoDbClient;
