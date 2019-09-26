const sinon = require('sinon');
const AWS = require('aws-sdk');
const AWSMock = require('aws-sdk-mock');
const faker = require('faker');
const HashKeyRepository = require('./hashRepository');
const validate = require('./validator');

const DocumentClient = 'DynamoDB.DocumentClient';

describe('When getting item by hash key', () => {
  let validateStub;
  let getStub;

  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
    validateStub = sinon.stub(validate, 'hashKeyRepoConstructor');
    getStub = sinon.stub().returns(Promise.resolve({ Item: {} }));
    AWSMock.mock(DocumentClient, 'get', getStub);
  });

  afterEach(() => {
    validateStub.restore();
    AWSMock.restore(DocumentClient);
  });

  it('should call dynamodb get with table name', async () => {
    // ARRANGE
    const tableName = 'tableNameValue';
    const repo = new HashKeyRepository({ tableName, hashKeyName: 'x' });

    // ACT
    await repo.get();

    // ASSERT
    const expectedArgFragment = { TableName: tableName };
    expect(getStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  it('should call dynamodb with hash key name', async () => {
    // ARRANGE
    const hashKey = 'hashKeyValue';
    const hashKeyName = 'hashKeyName';
    const repo = new HashKeyRepository({ tableName: 'x', hashKeyName });

    // ACT
    await repo.get(hashKey);

    // ASSERT
    const expectedKey = {};
    expectedKey[hashKeyName] = hashKey;
    const expectedArgFragment = { Key: expectedKey };
    expect(getStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  it('should return the item', async () => {
    // ARRANGE
    const itemToReturn = { foo: 'fooValue', bar: 'barValue' };
    AWSMock.restore(DocumentClient);
    getStub = sinon.stub().returns(Promise.resolve({ Item: itemToReturn }));
    AWSMock.mock(DocumentClient, 'get', getStub);
    const repo = new HashKeyRepository({ tableName: 'x', hashKeyName: 'x' });

    // ACT
    const result = await repo.get();

    // ASSERT
    expect(result).toEqual(itemToReturn);
  });

  describe('and dynamodb cannot find anything with hashkey', () => {
    it('should throw NotFound', () => {
      // ARRANGE
      AWSMock.restore(DocumentClient);
      getStub = sinon.stub().returns(Promise.resolve({}));
      AWSMock.mock(DocumentClient, 'get', getStub);
      const hashKey = 'hashKeyValue';
      const repo = new HashKeyRepository({ tableName: 'x', hashKeyName: 'x' });

      // ACT
      const getAction = () => repo.get(hashKey);

      // ASSERT
      return expect(getAction())
        .rejects
        .toHaveProperty('statusCode', 404);
    });

    it('should throw message about hashkey', () => {
      // ARRANGE
      AWSMock.restore(DocumentClient);
      getStub = sinon.stub().returns(Promise.resolve({}));
      AWSMock.mock(DocumentClient, 'get', getStub);
      const hashKey = faker.lorem.word();
      const hashKeyName = faker.lorem.word();
      const repo = new HashKeyRepository({ tableName: 'x', hashKeyName });

      // ACT
      const getAction = () => repo.get(hashKey);

      // ASSERT
      return expect(getAction())
        .rejects
        .toHaveProperty('message', `No ${hashKeyName} found for ${hashKey}`);
    });
  });
});
