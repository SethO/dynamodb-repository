const sinon = require('sinon');
const AWS = require('aws-sdk');
const AWSMock = require('aws-sdk-mock');
const {faker} = require('@faker-js/faker');
const KeyValueRepository = require('./keyValueRepository');
const validate = require('./validator');

const DocumentClient = 'DynamoDB.DocumentClient';

describe('When getting item by hash key', () => {
  let validateStub;
  let getStub;

  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
    validateStub = sinon.stub(validate, 'keyValueRepoConstructor');
    getStub = sinon.fake.resolves({ Item: {} });
    AWSMock.mock(DocumentClient, 'get', getStub);
  });

  afterEach(() => {
    validateStub.restore();
    AWSMock.restore(DocumentClient);
  });

  it('should call dynamodb get with table name', async () => {
    // ARRANGE
    const tableName = 'tableNameValue';
    const repo = new KeyValueRepository({ tableName, keyName: 'x' });

    // ACT
    await repo.get();

    // ASSERT
    const expectedArgFragment = { TableName: tableName };
    expect(getStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  it('should call dynamodb with hash key name', async () => {
    // ARRANGE
    const hashKey = 'hashKeyValue';
    const keyName = 'keyName';
    const repo = new KeyValueRepository({ tableName: 'x', keyName });

    // ACT
    await repo.get(hashKey);

    // ASSERT
    const expectedKey = {};
    expectedKey[keyName] = hashKey;
    const expectedArgFragment = { Key: expectedKey };
    expect(getStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  it('should return the item', async () => {
    // ARRANGE
    const itemToReturn = { foo: 'fooValue', bar: 'barValue' };
    AWSMock.restore(DocumentClient);
    getStub = sinon.fake.resolves({ Item: itemToReturn });
    AWSMock.mock(DocumentClient, 'get', getStub);
    const repo = new KeyValueRepository({ tableName: 'x', keyName: 'x' });

    // ACT
    const result = await repo.get();

    // ASSERT
    expect(result).toEqual(itemToReturn);
  });

  describe('and dynamodb cannot find anything with hashkey', () => {
    it('should throw NotFound', () => {
      // ARRANGE
      AWSMock.restore(DocumentClient);
      getStub = sinon.fake.resolves({});
      AWSMock.mock(DocumentClient, 'get', getStub);
      const hashKey = 'hashKeyValue';
      const repo = new KeyValueRepository({ tableName: 'x', keyName: 'x' });

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
      getStub = sinon.fake.resolves({});
      AWSMock.mock(DocumentClient, 'get', getStub);
      const hashKey = faker.lorem.word();
      const keyName = faker.lorem.word();
      const repo = new KeyValueRepository({ tableName: 'x', keyName });

      // ACT
      const getAction = () => repo.get(hashKey);

      // ASSERT
      return expect(getAction())
        .rejects
        .toHaveProperty('message', `No ${keyName} found for ${hashKey}`);
    });
  });
});
