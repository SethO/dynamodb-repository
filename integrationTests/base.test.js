const AWS = require('aws-sdk');

describe('When testing dynamodb connection', () => {
  it('should use environment variable credentials to hit DB', async () => {
    const params = {
      TableName: 'Movies',
      ProjectionExpression: '#year, title, info.rating',
      KeyConditionExpression: '#year = :year',
      ExpressionAttributeNames: {
        '#year': 'year',
      },
      ExpressionAttributeValues: {
        ':year': 2000,
      },
    };
    const docClient = new AWS.DynamoDB.DocumentClient();
    const result = await docClient.query(params).promise();

    console.log(process.env);
    expect(result.Items).toHaveLength(82);
  });
});
