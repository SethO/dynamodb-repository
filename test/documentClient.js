const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const DynamoDbConfig = {
  region: 'us-east-1',
};

let client;

const getDynamoDbClient = () => {
  if (client) {
    return client;
  }
  const ddbClient = new DynamoDBClient(DynamoDbConfig);
  client = DynamoDBDocumentClient.from(ddbClient);

  return client;
};

module.exports = getDynamoDbClient;
