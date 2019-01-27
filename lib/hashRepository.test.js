const sinon = require('sinon');
const AWS = require('aws-sdk-mock');
const HashKeyRepository = require('./hashRepository');
const validate = require('./validator');

const DocumentClient = 'DynamoDB.DocumentClient';

describe('When instantiating hashKey repository', () => {
  let validateStub;
  beforeEach(() => {
    validateStub = sinon.stub(validate, 'hashKeyRepoConstructor');
  });

  afterEach(() => {
    validateStub.restore();
  });

  it('should store table name', () => {
    // ARRANGE
    const tableName = 'myTableName';

    // ACT
    const repo = new HashKeyRepository({ tableName });

    // ASSERT
    expect(repo.tableName).toEqual(tableName);
  });

  it('should store hashKeyName', () => {
    // ARRANGE
    const hashKeyName = 'myHashKeyName';
    const tableName = 'nothing';

    // ACT
    const repo = new HashKeyRepository({ tableName, hashKeyName });

    // ASSERT
    expect(repo.hashKeyName).toEqual(hashKeyName);
  });

  it('should call validator', () => {
    // ARRANGE
    const tableName = undefined;
    const hashKeyName = 'something';

    // ACT
    // eslint-disable-next-line no-new
    new HashKeyRepository({ tableName, hashKeyName });

    // ASSERT
    expect(validateStub.calledOnce).toBeTrue();
  });

  describe('and validator fails validation', () => {
    it('should throw error', () => {
      // ARRANGE
      const tableName = undefined;
      const hashKeyName = 'something';
      validateStub.throws('BAM');

      // ACT
      const contructorAction = () => new HashKeyRepository({ tableName, hashKeyName });

      // ASSERT
      expect(contructorAction).toThrow();
    });
  });
});

describe('When getting item by hash key', () => {
  let validateStub;
  let getStub;

  beforeEach(() => {
    validateStub = sinon.stub(validate, 'hashKeyRepoConstructor');
    getStub = sinon.stub().returns(Promise.resolve({ Item: {} }));
    AWS.mock(DocumentClient, 'get', getStub);
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
});
