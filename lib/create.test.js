const faker = require('faker');
const AWS = require('aws-sdk-mock');
const sinon = require('sinon');
const HashKeyRepository = require('./hashRepository');

const DocumentClient = 'DynamoDB.DocumentClient';

describe('When creating item', () => {
  let putStub;

  beforeEach(() => {
    putStub = sinon.stub().returns(Promise.resolve({ Item: {} }));
    AWS.mock(DocumentClient, 'put', putStub);
  });

  afterEach(() => {
    AWS.restore(DocumentClient);
  });

  it('should work with deep clone and not a reference', async () => {
    // ARRANGE
    const originalObject = faker.helpers.userCard();
    const hashKeyName = 'key';
    const repo = new HashKeyRepository({ tableName: 'x', hashKeyName });

    // ACT
    await repo.create(originalObject);

    // ASSERT
    expect(originalObject.hashKeyName).toBeUndefined();
    expect(originalObject.createdAt).toBeUndefined();
    expect(originalObject.updatedAt).toBeUndefined();
  });

  it('should set a string key with hashKeyName', async () => {
    // ARRANGE
    const originalObject = faker.helpers.userCard();
    const hashKeyName = faker.lorem.word();
    const repo = new HashKeyRepository({ tableName: 'x', hashKeyName });

    // ACT
    const result = await repo.create(originalObject);

    // ASSERT
    expect(result[hashKeyName]).toBeDefined();
    expect(typeof result[hashKeyName]).toBe('string');
  });

  it('should not have dashes in hashkey value', async () => {
    // ARRANGE
    const originalObject = faker.helpers.userCard();
    const hashKeyName = faker.lorem.word();
    const repo = new HashKeyRepository({ tableName: 'x', hashKeyName });

    // ACT
    const result = await repo.create(originalObject);

    // ASSERT
    expect(result[hashKeyName]).not.toMatch(/-/);
  });

  it('should return item with a UTC createdAt timestamp in ISO 8601', async () => {
    // ARRANGE
    const repo = new HashKeyRepository({ tableName: 'x', hashKeyName: 'y' });


    // ACT
    const result = await repo.create({});

    // ASSERT
    // matcher source https://www.myintervals.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/
    const iso8601Matcher = /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([.,]\d+(?!:))?)?(\17[0-5]\d([.,]\d+)?)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
    expect(result.createdAt).toMatch(iso8601Matcher);
  });

  it('should return item with a UTC updatedAt timestamp in ISO 8601', async () => {
    // ARRANGE
    const repo = new HashKeyRepository({ tableName: 'x', hashKeyName: 'y' });


    // ACT
    const result = await repo.create({});

    // ASSERT
    // matcher source https://www.myintervals.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/
    const iso8601Matcher = /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([.,]\d+(?!:))?)?(\17[0-5]\d([.,]\d+)?)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
    expect(result.updatedAt).toMatch(iso8601Matcher);
  });

  it('should call dynamodb get with table name', async () => {
    // ARRANGE
    const tableName = 'tableNameValue';
    const repo = new HashKeyRepository({ tableName, hashKeyName: 'x' });

    // ACT
    await repo.create({});

    // ASSERT
    const expectedArgFragment = { TableName: tableName };
    expect(putStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  it('should call dynamodb get with item', async () => {
    // ARRANGE
    const item = { myField: faker.lorem.word() };
    const repo = new HashKeyRepository({ tableName: 'x', hashKeyName: 'y' });

    // ACT
    await repo.create(item);

    // ASSERT
    const expectedArgFragment = { Item: { myField: item.myField } };
    expect(putStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });
});
