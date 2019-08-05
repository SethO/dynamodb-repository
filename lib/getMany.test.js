const sinon = require('sinon');
const AWS = require('aws-sdk-mock');
const faker = require('faker');
const HashKeyRepository = require('./hashRepository');
const validate = require('./validator');

const DocumentClient = 'DynamoDB.DocumentClient';

describe('When getting many items', () => {
  let validateStub;
  let scanStub;

  beforeEach(() => {
    validateStub = sinon.stub(validate, 'hashKeyRepoConstructor');
    scanStub = sinon.stub().returns(Promise.resolve({ Items: [] }));
    AWS.mock(DocumentClient, 'scan', scanStub);
  });

  afterEach(() => {
    validateStub.restore();
    AWS.restore(DocumentClient);
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

  it('should return items', async () => {
    // ARRANGE
    const itemsToReturn = [
      faker.helpers.createCard(),
      faker.helpers.createCard(),
    ];
    AWS.restore(DocumentClient);
    scanStub = sinon.stub().returns(Promise.resolve({ Items: itemsToReturn }));
    AWS.mock(DocumentClient, 'scan', scanStub);
    const repo = new HashKeyRepository({
      tableName: faker.lorem.word(),
      hashKeyName: faker.lorem.word(),
    });

    // ACT
    const result = await repo.getMany();

    // ASSERT
    expect(result.items).toEqual(itemsToReturn);
  });
});
