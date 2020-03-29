const sinon = require('sinon');
const AWS = require('aws-sdk');
const AWSMock = require('aws-sdk-mock');
const KeyValueRepository = require('./keyValueRepository');
const validate = require('./validator');

const DocumentClient = 'DynamoDB.DocumentClient';

describe('When removing item by hash key', () => {
  let validateStub;
  let deleteStub;

  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
    validateStub = sinon.stub(validate, 'keyValueRepoConstructor');
    deleteStub = sinon.fake.resolves({ Item: {} });
    AWSMock.mock(DocumentClient, 'delete', deleteStub);
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
    await repo.remove();

    // ASSERT
    const expectedArgFragment = { TableName: tableName };
    expect(deleteStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  it('should call dynamodb with hash key name', async () => {
    // ARRANGE
    const hashKey = 'hashKeyValue';
    const keyName = 'keyName';
    const repo = new KeyValueRepository({ tableName: 'x', keyName });

    // ACT
    await repo.remove(hashKey);

    // ASSERT
    const expectedKey = {};
    expectedKey[keyName] = hashKey;
    const expectedArgFragment = { Key: expectedKey };
    expect(deleteStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });
});
