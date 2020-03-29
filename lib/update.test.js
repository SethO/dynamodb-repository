const faker = require('faker');
const AWS = require('aws-sdk');
const AWSMock = require('aws-sdk-mock');
const { fake } = require('sinon');
const KeyValueRepository = require('./keyValueRepository');

const DocumentClient = 'DynamoDB.DocumentClient';

describe('When updating item', () => {
  let putStub;
  let getStub;

  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
    getStub = fake.returns(Promise.resolve({ Item: {} }));
    putStub = fake.returns(Promise.resolve({ Item: {} }));
    AWSMock.mock(DocumentClient, 'put', putStub);
    AWSMock.mock(DocumentClient, 'get', getStub);
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

  it('should call dynamodb get item', async () => {
    // ARRANGE
    const item = { id: 'foo' };
    const repo = new KeyValueRepository({ tableName: 'x', keyName: 'id' });

    // ACT
    await repo.update(item);

    // ASSERT
    expect(getStub.calledOnce).toBeTrue();
  });

  it('should use the original createdAt field', async () => {
    // ARRANGE
    const itemFromGet = { createdAt: faker.date.past() };
    AWSMock.restore(DocumentClient);
    getStub = fake.resolves({ Item: itemFromGet });
    AWSMock.mock(DocumentClient, 'get', getStub);
    AWSMock.mock(DocumentClient, 'put', putStub);
    const repo = new KeyValueRepository({ tableName: 'x', keyName: 'key' });

    // ACT
    await repo.update({ key: 'x' });

    // ASSERT
    const expectedArgFragment = { Item: itemFromGet };
    expect(putStub.calledWithMatch(expectedArgFragment)).toBeTrue();
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
    const item = { myField: faker.lorem.word(), key: faker.random.uuid() };
    const repo = new KeyValueRepository({ tableName: faker.lorem.word(), keyName: 'key' });

    // ACT
    await repo.update(item);

    // ASSERT
    const expectedArgFragment = { Item: { myField: item.myField } };
    expect(putStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  it('should overwrite updatedAt property', async () => {
    // ARRANGE
    const dateString = faker.date.past().toISOString();
    const item = { updatedAt: dateString, key: faker.random.uuid() };
    const repo = new KeyValueRepository({ tableName: 'items', keyName: 'key' });

    // ACT
    await repo.update(item);

    // ASSERT
    const argToDynamoDB = putStub.args[0][0];
    expect(argToDynamoDB.Item.updatedAt).not.toEqual(dateString);
  });

  it('should return the updated item', async () => {
    // ARRANGE
    const itemFromGet = { createdAt: faker.date.past() };
    AWSMock.restore(DocumentClient);
    getStub = fake.resolves({ Item: itemFromGet });
    AWSMock.mock(DocumentClient, 'get', getStub);
    AWSMock.mock(DocumentClient, 'put', putStub);
    const repo = new KeyValueRepository({ tableName: faker.lorem.word(), keyName: 'key' });

    // ACT
    const result = await repo.update({ key: 'x' });

    // ASSERT
    expect(result.createdAt).toEqual(itemFromGet.createdAt);
  });
});
