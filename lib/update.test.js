const faker = require('faker');
const AWS = require('aws-sdk-mock');
const sinon = require('sinon');
const HashKeyRepository = require('./hashRepository');

const DocumentClient = 'DynamoDB.DocumentClient';

describe('When creating item', () => {
  let putStub;
  let getStub;

  beforeEach(() => {
    getStub = sinon.stub().returns(Promise.resolve({ Item: {} }));
    putStub = sinon.stub().returns(Promise.resolve({ Item: {} }));
    AWS.mock(DocumentClient, 'put', putStub);
    AWS.mock(DocumentClient, 'get', getStub);
  });

  afterEach(() => {
    AWS.restore(DocumentClient);
  });

  describe('and item does not have property of [hashKeyName]', () => {
    it('should throw Bad Request', () => {
      // ARRANGE
      const hashKeyName = faker.lorem.word();
      const itemWithNoHashKeyName = {};
      const repo = new HashKeyRepository({ tableName: 'x', hashKeyName });

      // ACT
      const updateAction = () => repo.update(itemWithNoHashKeyName);

      // ASSERT
      return expect(updateAction())
        .rejects
        .toHaveProperty('statusCode', 400);
    });
  });

  it('should call dynamodb get item', async () => {
    // ARRANGE
    const item = { id: 'foo' };
    const repo = new HashKeyRepository({ tableName: 'x', hashKeyName: 'id' });

    // ACT
    await repo.update(item);

    // ASSERT
    expect(getStub.calledOnce).toBeTrue();
  });

  it('should use the original createdAt field', async () => {
    // ARRANGE
    const itemFromGet = { createdAt: faker.date.past() };
    AWS.restore(DocumentClient);
    getStub = sinon.stub().returns(Promise.resolve({ Item: itemFromGet }));
    AWS.mock(DocumentClient, 'get', getStub);
    AWS.mock(DocumentClient, 'put', putStub);
    const repo = new HashKeyRepository({ tableName: 'x', hashKeyName: 'key' });

    // ACT
    await repo.update({ key: 'x' });

    // ASSERT
    const expectedArgFragment = { Item: itemFromGet };
    expect(putStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  it('should call dynamodb put with table name', async () => {
    // ARRANGE
    const tableName = faker.lorem.word();
    const repo = new HashKeyRepository({ tableName, hashKeyName: 'id' });

    // ACT
    await repo.update({ id: 'x' });

    // ASSERT
    const expectedArgFragment = { TableName: tableName };
    expect(putStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  it('should call dynamodb put with item', async () => {
    // ARRANGE
    const item = { myField: faker.lorem.word(), key: faker.random.uuid() };
    const repo = new HashKeyRepository({ tableName: faker.lorem.word(), hashKeyName: 'key' });

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
    const repo = new HashKeyRepository({ tableName: 'items', hashKeyName: 'key' });

    // ACT
    await repo.update(item);

    // ASSERT
    const argToDynamoDB = putStub.args[0][0];
    expect(argToDynamoDB.Item.updatedAt).not.toEqual(dateString);
  });

  it('should return the updated item', async () => {
    // ARRANGE
    const itemFromGet = { createdAt: faker.date.past() };
    AWS.restore(DocumentClient);
    getStub = sinon.stub().returns(Promise.resolve({ Item: itemFromGet }));
    AWS.mock(DocumentClient, 'get', getStub);
    AWS.mock(DocumentClient, 'put', putStub);
    const repo = new HashKeyRepository({ tableName: faker.lorem.word(), hashKeyName: 'key' });

    // ACT
    const result = await repo.update({ key: 'x' });

    // ASSERT
    expect(result.createdAt).toEqual(itemFromGet.createdAt);
  });
});
