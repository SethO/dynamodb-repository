const sinon = require('sinon');
const AWS = require('aws-sdk');
const AWSMock = require('aws-sdk-mock');
const faker = require('faker');
const HashKeyRepository = require('./hashRepository');
const validate = require('./validator');
const { createCursor } = require('./utils');

const DocumentClient = 'DynamoDB.DocumentClient';

describe('When getting many items', () => {
  let validateStub;
  let scanStub;

  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
    validateStub = sinon.stub(validate, 'hashKeyRepoConstructor');
    scanStub = sinon.stub().returns(Promise.resolve({ Items: [] }));
    AWSMock.mock(DocumentClient, 'scan', scanStub);
  });

  afterEach(() => {
    validateStub.restore();
    AWSMock.restore(DocumentClient);
  });

  it('should call dynamodb scan with table name', async () => {
    // ARRANGE
    const tableName = 'tableNameValue';
    const repo = new HashKeyRepository({ tableName, hashKeyName: faker.lorem.word() });

    // ACT
    await repo.getMany();

    // ASSERT
    const expectedArgFragment = { TableName: tableName };
    expect(scanStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  describe('with no limit provided', () => {
    it('should call dynamodb scann with limit of 100', async () => {
      // ARRANGE
      const repo = new HashKeyRepository({
        tableName: faker.lorem.word(),
        hashKeyName: faker.lorem.word(),
      });

      // ACT
      await repo.getMany();

      // ASSERT
      const expectedArgFragment = { Limit: 100 };
      expect(scanStub.calledWithMatch(expectedArgFragment)).toBeTrue();
    });
  });

  describe('with a specific limit provided', () => {
    it('should call dynamodb scann with provided limit', async () => {
      // ARRANGE
      const myLimit = 99;
      const repo = new HashKeyRepository({
        tableName: faker.lorem.word(),
        hashKeyName: faker.lorem.word(),
      });

      // ACT
      await repo.getMany({ limit: myLimit });

      // ASSERT
      const expectedArgFragment = { Limit: myLimit };
      expect(scanStub.calledWithMatch(expectedArgFragment)).toBeTrue();
    });
  });

  describe('with no cursor', () => {
    it('should pass no cursor to dynamodb', async () => {
      // ARRANGE
      const repo = new HashKeyRepository({
        tableName: faker.lorem.word(),
        hashKeyName: faker.lorem.word(),
      });

      // ACT
      await repo.getMany();

      // ASSERT
      const expectedArgs = { Limit: 100, TableName: repo.tableName };
      expect(scanStub.calledWith(expectedArgs)).toBeTrue();
    });
  });

  describe('with valid cursor', () => {
    it('should pass parsed cursor to dynamodb', async () => {
      // ARRANGE
      const hashKeyName = faker.lorem.word();
      const rawCursor = faker.random.uuid();
      const encodedCursor = createCursor(rawCursor);
      const repo = new HashKeyRepository({
        tableName: faker.lorem.word(),
        hashKeyName,
      });

      // ACT
      await repo.getMany({ cursor: encodedCursor });

      // ASSERT
      const expectedArgFragment = { ExclusiveStartKey: rawCursor };
      expect(scanStub.calledWithMatch(expectedArgFragment)).toBeTrue();
    });
  });

  it('should return items', async () => {
    // ARRANGE
    const itemsToReturn = [
      faker.helpers.createCard(),
      faker.helpers.createCard(),
    ];
    AWSMock.restore(DocumentClient);
    scanStub = sinon.stub().returns(Promise.resolve({ Items: itemsToReturn }));
    AWSMock.mock(DocumentClient, 'scan', scanStub);
    const repo = new HashKeyRepository({
      tableName: faker.lorem.word(),
      hashKeyName: faker.lorem.word(),
    });

    // ACT
    const result = await repo.getMany();

    // ASSERT
    expect(result.items).toEqual(itemsToReturn);
  });

  describe('and dynamodb throws a ValidationException', () => {
    it('should throw a 400', () => {
      // ARRANGE
      const dynamoDbError = { code: 'ValidationException' };
      AWSMock.restore(DocumentClient);
      scanStub = sinon.stub().returns(Promise.reject(dynamoDbError));
      AWSMock.mock(DocumentClient, 'scan', scanStub);
      const repo = new HashKeyRepository({
        tableName: faker.lorem.word(),
        hashKeyName: faker.lorem.word(),
      });

      // ACT
      const getManyAction = async () => { await repo.getMany(); };

      // ASSERT
      return expect(getManyAction()).rejects
        .toHaveProperty('statusCode', 400);
    });

    it('should throw with "cursor not valid"', async () => {
      // ARRANGE
      const dynamoDbError = { code: 'ValidationException' };
      AWSMock.restore(DocumentClient);
      scanStub = sinon.stub().returns(Promise.reject(dynamoDbError));
      AWSMock.mock(DocumentClient, 'scan', scanStub);
      const repo = new HashKeyRepository({
        tableName: faker.lorem.word(),
        hashKeyName: faker.lorem.word(),
      });

      // ACT
      const getManyAction = async () => { await repo.getMany(); };

      // ASSERT
      await expect(getManyAction()).rejects.toThrow('cursor is not valid');
    });
  });

  describe('and dynamodb throws an unknown exception', () => {
    it('should re-throw the same error from dynamodb', () => {
      // ARRANGE
      const unknownError = { message: 'error message in test' };
      AWSMock.restore(DocumentClient);
      scanStub = sinon.stub().returns(Promise.reject(unknownError));
      AWSMock.mock(DocumentClient, 'scan', scanStub);
      const repo = new HashKeyRepository({
        tableName: faker.lorem.word(),
        hashKeyName: faker.lorem.word(),
      });

      // ACT
      const getManyAction = async () => { await repo.getMany(); };

      // ASSERT
      return expect(getManyAction()).rejects
        .toHaveProperty('message', unknownError.message);
    });
  });

  describe('and dynamodb returns a LastEvaluatedKey', () => {
    it('should return as string encoded cursor', async () => {
      // ARRANGE
      const lastEvaluatedKey = faker.random.uuid();
      AWSMock.restore(DocumentClient);
      scanStub = sinon.stub().returns(Promise.resolve({
        Items: [],
        LastEvaluatedKey: lastEvaluatedKey,
      }));
      AWSMock.mock(DocumentClient, 'scan', scanStub);
      const repo = new HashKeyRepository({
        tableName: faker.lorem.word(),
        hashKeyName: faker.lorem.word(),
      });

      // ACT
      const result = await repo.getMany();

      // ASSERT
      const expectedCursor = createCursor(lastEvaluatedKey);
      expect(result.cursor).toEqual(expectedCursor);
    });
  });
});
