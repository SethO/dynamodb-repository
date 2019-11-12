const faker = require('faker');
const { removeHashKeyItem, createHashKeyItem, insertHashKeyItem } = require('./integrationTestUtils');
const { HashKeyRepository } = require('../index');

const TableName = 'HashKeyTestDB';
const HashKeyName = 'key';

describe('When updating an item', () => {
  const testKeys = [];

  afterAll(async () => {
    const promises = testKeys.map(async (testKey) => removeHashKeyItem(testKey));
    await Promise.all(promises);
  });

  describe('and item does not have property of [hashKeyName]', () => {
    it('should return a 400 (Bad Request)', () => {
      // ARRANGE
      const itemWithNoKey = {};
      const repo = new HashKeyRepository({ tableName: TableName, hashKeyName: HashKeyName });

      // ACT
      const updateAction = () => repo.update(itemWithNoKey);

      // ASSERT
      return expect(updateAction())
        .rejects
        .toHaveProperty('statusCode', 400);
    });
  });

  describe('and item does not exist in db', () => {
    it('should return a 404 (Not Found)', async () => {
      // ARRANGE
      const item = await createHashKeyItem();
      const repo = new HashKeyRepository({ tableName: TableName, hashKeyName: HashKeyName });

      // ACT
      const updateAction = () => repo.update(item);

      // ASSERT
      return expect(updateAction())
        .rejects
        .toHaveProperty('statusCode', 404);
    });
  });

  it('should maintain original createdAt value', async () => {
    // ARRANGE
    const item = await createHashKeyItem();
    const originalCreatedAt = item.createdAt;
    const key = await insertHashKeyItem(item);
    testKeys.push(key);
    const repo = new HashKeyRepository({ tableName: TableName, hashKeyName: HashKeyName });
    item.createdAt = faker.date.future().toISOString();

    // ACT
    const result = await repo.update(item);

    // ASSERT
    expect(result.createdAt).toEqual(originalCreatedAt);
  });
  
  it('should change original updatedAt value', async () => {
    // ARRANGE
    const item = await createHashKeyItem();
    const originalCreatedAt = faker.date.past().toISOString();
    item.createdAt = originalCreatedAt;
    item.updatedAt = originalCreatedAt;
    const key = await insertHashKeyItem(item);
    testKeys.push(key);
    const repo = new HashKeyRepository({ tableName: TableName, hashKeyName: HashKeyName });
    const newCreatedAt = faker.date.future().toISOString();
    item.createdAt = newCreatedAt;

    // ACT
    const result = await repo.update(item);

    // ASSERT
    expect(result.createdAt).toEqual(originalCreatedAt);
  });
});