import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const DynamoDbConfig = {
  region: 'us-east-1',
};

let client: DynamoDBDocumentClient;

const getDocumentClient = () => {
  if (client) {
    return client;
  }
  const ddbClient = new DynamoDBClient(DynamoDbConfig);
  client = DynamoDBDocumentClient.from(ddbClient);

  return client;
};

export default getDocumentClient;
