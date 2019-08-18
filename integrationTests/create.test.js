const { removeHashKeyItem, createHashKeyItem, fetchHashKeyItem } = require('./integrationTestUtils');
const { HashKeyRepository } = require('../index');

const TableName = 'HashKeyTestDB';
const HashKeyName = 'key';

describe('When creating item', () => {
  const testKeys = [];

  afterAll(async () => {
    const promises = testKeys.map(async testKey => removeHashKeyItem(testKey));
    await Promise.all(promises);
  });

  it('should save item to db', async () => {
    // ARRANGE
    const item = await createHashKeyItem();
    const repo = new HashKeyRepository({ tableName: TableName, hashKeyName: HashKeyName });

    // ACT
    const result = await repo.create(item);
    testKeys.push(result.key);

    // ASSERT
    const itemFromDB = await fetchHashKeyItem(result.key);
    expect(itemFromDB).not.toBeUndefined();
  });

  it('should replace any id on provided item', async () => {
    // ARRANGE
    const item = await createHashKeyItem();
    const repo = new HashKeyRepository({ tableName: TableName, hashKeyName: HashKeyName });

    // ACT
    const result = await repo.create(item);
    testKeys.push(result.key);

    // ASSERT
    expect(result.key).not.toEqual(item.key);
    const itemFromDB = await fetchHashKeyItem(result.key);
    expect(itemFromDB.key).not.toEqual(item.key);
  });

  it('should set createdAt and updateAt', async () => {
    // ARRANGE
    const item = await createHashKeyItem();
    const repo = new HashKeyRepository({ tableName: TableName, hashKeyName: HashKeyName });

    // ACT
    const result = await repo.create(item);
    testKeys.push(result.key);

    // ASSERT
    expect(result.createdAt).not.toBeUndefined();
    expect(result.createdAt).toEqual(result.updatedAt);
    const itemFromDB = await fetchHashKeyItem(result.key);
    expect(itemFromDB.createdAt).not.toBeUndefined();
    expect(itemFromDB.createdAt).toEqual(itemFromDB.updatedAt);
  });
});
