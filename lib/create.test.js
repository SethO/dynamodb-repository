const faker = require('faker');
const AWS = require('aws-sdk');
const AWSMock = require('aws-sdk-mock');
const sinon = require('sinon');
const KeyValueRepository = require('./keyValueRepository');

const DocumentClient = 'DynamoDB.DocumentClient';

describe('When creating item', () => {
  let putStub;

  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
    putStub = sinon.stub().returns(Promise.resolve({ Item: {} }));
    AWSMock.mock(DocumentClient, 'put', putStub);
  });

  afterEach(() => {
    AWSMock.restore(DocumentClient);
  });

  it('should work with copy and not a reference', async () => {
    // ARRANGE
    const originalObject = faker.helpers.userCard();
    const keyName = 'key';
    const repo = new KeyValueRepository({ tableName: 'x', keyName });

    // ACT
    await repo.create(originalObject);

    // ASSERT
    expect(originalObject.keyName).toBeUndefined();
    expect(originalObject.createdAt).toBeUndefined();
    expect(originalObject.updatedAt).toBeUndefined();
  });

  it('should set a string key with keyName', async () => {
    // ARRANGE
    const originalObject = faker.helpers.userCard();
    const keyName = faker.lorem.word();
    const repo = new KeyValueRepository({ tableName: 'x', keyName });

    // ACT
    const result = await repo.create(originalObject);

    // ASSERT
    expect(result[keyName]).toBeDefined();
    expect(typeof result[keyName]).toBe('string');
  });

  it('should not have dashes in hashkey value', async () => {
    // ARRANGE
    const originalObject = faker.helpers.userCard();
    const keyName = faker.lorem.word();
    const repo = new KeyValueRepository({ tableName: 'x', keyName });

    // ACT
    const result = await repo.create(originalObject);

    // ASSERT
    expect(result[keyName]).not.toMatch(/-/);
  });

  it('should return item with a UTC createdAt timestamp in ISO 8601', async () => {
    // ARRANGE
    const repo = new KeyValueRepository({ tableName: 'x', keyName: 'y' });


    // ACT
    const result = await repo.create({});

    // ASSERT
    // matcher source https://www.myintervals.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/
    const iso8601Matcher = /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([.,]\d+(?!:))?)?(\17[0-5]\d([.,]\d+)?)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
    expect(result.createdAt).toMatch(iso8601Matcher);
  });

  it('should return item with a UTC updatedAt timestamp in ISO 8601', async () => {
    // ARRANGE
    const repo = new KeyValueRepository({ tableName: 'x', keyName: 'y' });


    // ACT
    const result = await repo.create({});

    // ASSERT
    // matcher source https://www.myintervals.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/
    const iso8601Matcher = /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([.,]\d+(?!:))?)?(\17[0-5]\d([.,]\d+)?)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
    expect(result.updatedAt).toMatch(iso8601Matcher);
  });

  it('should call dynamodb put with table name', async () => {
    // ARRANGE
    const tableName = 'tableNameValue';
    const repo = new KeyValueRepository({ tableName, keyName: 'x' });

    // ACT
    await repo.create({});

    // ASSERT
    const expectedArgFragment = { TableName: tableName };
    expect(putStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });

  it('should call dynamodb put with item', async () => {
    // ARRANGE
    const item = { myField: faker.lorem.word() };
    const repo = new KeyValueRepository({ tableName: 'x', keyName: 'y' });

    // ACT
    await repo.create(item);

    // ASSERT
    const expectedArgFragment = { Item: { myField: item.myField } };
    expect(putStub.calledWithMatch(expectedArgFragment)).toBeTrue();
  });
});
