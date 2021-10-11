const faker = require('faker');
const AWS = require('aws-sdk');
const AWSMock = require('aws-sdk-mock');
const { fake } = require('sinon');
const KeyValueRepository = require('./keyValueRepository');

const DocumentClient = 'DynamoDB.DocumentClient';

describe('When updating item', () => {
  let putStub;

  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
    putStub = fake.returns(Promise.resolve({ Item: {} }));
    AWSMock.mock(DocumentClient, 'put', putStub);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  describe('and item does not have property of [keyName]', () => {
    it('should throw Bad Request', () => {
      // ARRANGE
      const keyName = faker.lorem.word();
      const itemWithNoKeyName = {};
      const repo = new KeyValueRepository({ tableName: 'x', keyName });

      // ACT
      const updateAction = () => repo.update(itemWithNoKeyName);

      // ASSERT
      return expect(updateAction())
        .rejects
        .toHaveProperty('statusCode', 400);
    });
  });

  it('should call dynamodb put with table name', async () => {
    // ARRANGE
    const tableName = faker.lorem.word();
    const repo = new KeyValueRepository({ tableName, keyName: 'id' });

    // ACT
    await repo.update({ id: 'x' });

    // ASSERT
    const expectedArgFragment = { TableName: tableName };
    expect(putStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  it('should call dynamodb put with item', async () => {
    // ARRANGE
    const item = { myField: faker.lorem.word(), key: faker.datatype.uuid() };
    const repo = new KeyValueRepository({ tableName: faker.lorem.word(), keyName: 'key' });

    // ACT
    await repo.update(item);

    // ASSERT
    const expectedArgFragment = { Item: { myField: item.myField } };
    expect(putStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  it('should call dynamodb put with Condition Expression', async () => {
    // ARRANGE
    const repo = new KeyValueRepository({ tableName: faker.lorem.word(), keyName: 'key' });

    // ACT
    await repo.update({ key: 'x' });

    // ASSERT
    const expectedConditionExpression = 'attribute_exists(#key) AND revision = :prevRev AND createdAt = :createdAt';
    const expectedArgFragment = { ConditionExpression: expectedConditionExpression };
    expect(putStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  it('should call dynamodb put with Expression Attribute Names', async () => {
    // ARRANGE
    const keyName = faker.lorem.word();
    const item = {};
    item[keyName] = 'x';
    const repo = new KeyValueRepository({ tableName: faker.lorem.word(), keyName });

    // ACT
    await repo.update(item);

    // ASSERT
    const expectedArgFragment = { ExpressionAttributeNames: { '#key': keyName } };
    expect(putStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  it('should call dynamodb put with Expression Attribute Value prevRev', async () => {
    // ARRANGE
    const revision = faker.datatype.number({ min: 1, max: 100 });
    const item = { revision, key: faker.datatype.uuid() };
    const repo = new KeyValueRepository({ tableName: faker.lorem.word(), keyName: 'key' });

    // ACT
    await repo.update(item);

    // ASSERT
    const expectedArgFragment = { ExpressionAttributeValues: { ':prevRev': revision } };
    expect(putStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  it('should call dynamodb put with Expression Attribute Value createdAt', async () => {
    // ARRANGE
    const createdAt = faker.date.past();
    const item = { createdAt, key: faker.datatype.uuid() };
    const repo = new KeyValueRepository({ tableName: faker.lorem.word(), keyName: 'key' });

    // ACT
    await repo.update(item);

    // ASSERT
    const expectedArgFragment = { ExpressionAttributeValues: { ':createdAt': createdAt } };
    expect(putStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  it('should overwrite updatedAt property', async () => {
    // ARRANGE
    const dateString = faker.date.past().toISOString();
    const item = { updatedAt: dateString, key: faker.datatype.uuid() };
    const repo = new KeyValueRepository({ tableName: 'items', keyName: 'key' });

    // ACT
    await repo.update(item);

    // ASSERT
    const argToDynamoDB = putStub.args[0][0];
    expect(argToDynamoDB.Item.updatedAt).not.toEqual(dateString);
  });

  it('should increment the revision property', async () => {
    // ARRANGE
    const originalRevision = faker.datatype.number({ min: 1, max: 100 });
    const item = { revision: originalRevision, key: faker.datatype.uuid() };
    AWSMock.restore(DocumentClient);
    AWSMock.mock(DocumentClient, 'put', putStub);
    const repo = new KeyValueRepository({ tableName: 'items', keyName: 'key' });

    // ACT
    await repo.update(item);

    // ASSERT
    const argToDynamoDB = putStub.args[0][0];
    expect(argToDynamoDB.Item.revision).toEqual(originalRevision + 1);
  });

  it('should return the updated item', async () => {
    // ARRANGE
    AWSMock.restore(DocumentClient);
    AWSMock.mock(DocumentClient, 'put', putStub);
    const repo = new KeyValueRepository({ tableName: faker.lorem.word(), keyName: 'key' });

    // ACT
    const result = await repo.update({ key: 'x', myField: 'myValue' });

    // ASSERT
    expect(result.myField).toEqual('myValue');
  });

  describe('and the put call fails the condition expression', () => {
    it('should call getItem', async () => {
      // ARRANGE
      AWSMock.restore(DocumentClient);
      const error = new Error();
      error.code = 'ConditionalCheckFailedException';
      AWSMock.mock(DocumentClient, 'put', fake.returns(Promise.reject(error)));
      const getStub = fake.returns(Promise.resolve({ Item: {} }));
      AWSMock.mock(DocumentClient, 'get', getStub);
      const repo = new KeyValueRepository({ tableName: 'x', keyName: 'id' });

      // ACT
      await expect(repo.update({ id: 'foo' })).rejects.toThrow();

      // ASSERT
      expect(getStub.calledOnce).toBeTrue();
    });

    it('should throw 409 (Conflict)', async () => {
      // ARRANGE
      AWSMock.restore(DocumentClient);
      const error = new Error();
      error.code = 'ConditionalCheckFailedException';
      AWSMock.mock(DocumentClient, 'put', fake.returns(Promise.reject(error)));
      AWSMock.mock(DocumentClient, 'get', fake.returns(Promise.resolve({ Item: {} })));
      const repo = new KeyValueRepository({ tableName: 'x', keyName: 'id' });

      // ACT
      const updateAction = () => repo.update({ id: 'foo' });

      // ASSERT
      await expect(updateAction()).rejects.toHaveProperty('statusCode', 409);
    });
  });

  describe('and the put fails for unknown reason', () => {
    it('should throw the error', async () => {
      // ARRANGE
      AWSMock.restore(DocumentClient);
      const error = new Error();
      error.code = 'SomethingElse';
      AWSMock.mock(DocumentClient, 'put', fake.returns(Promise.reject(error)));
      AWSMock.mock(DocumentClient, 'get', fake.returns(Promise.resolve({ Item: {} })));
      const repo = new KeyValueRepository({ tableName: 'x', keyName: 'id' });

      // ACT
      const updateAction = () => repo.update({ id: 'foo' });

      // ASSERT
      await expect(updateAction()).rejects.toHaveProperty('code', 'SomethingElse');
    });
  });
});
