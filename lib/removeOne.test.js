const sinon = require('sinon');
const AWS = require('aws-sdk-mock');
const HashKeyRepository = require('./hashRepository');
const validate = require('./validator');

const DocumentClient = 'DynamoDB.DocumentClient';

describe('When removing item by hash key', () => {
  let validateStub;
  let deleteStub;

  beforeEach(() => {
    validateStub = sinon.stub(validate, 'hashKeyRepoConstructor');
    deleteStub = sinon.stub().returns(Promise.resolve({ Item: {} }));
    AWS.mock(DocumentClient, 'delete', deleteStub);
  });

  afterEach(() => {
    validateStub.restore();
    AWS.restore(DocumentClient);
  });

  it('should call dynamodb get with table name', async () => {
    // ARRANGE
    const tableName = 'tableNameValue';
    const repo = new HashKeyRepository({ tableName, hashKeyName: 'x' });

    // ACT
    await repo.remove();

    // ASSERT
    const expectedArgFragment = { TableName: tableName };
    expect(deleteStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  it('should call dynamodb with hash key name', async () => {
    // ARRANGE
    const hashKey = 'hashKeyValue';
    const hashKeyName = 'hashKeyName';
    const repo = new HashKeyRepository({ tableName: 'x', hashKeyName });

    // ACT
    await repo.remove(hashKey);

    // ASSERT
    const expectedKey = {};
    expectedKey[hashKeyName] = hashKey;
    const expectedArgFragment = { Key: expectedKey };
    expect(deleteStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });
});
