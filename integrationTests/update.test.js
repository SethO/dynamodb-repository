const { faker } = require('@faker-js/faker');
const { removeHashKeyItem, createKeyValueItem, insertHashKeyItem } = require('./integrationTestUtils');
const { KeyValueRepository } = require('../index');

const TableName = 'HashKeyTestDB';
const KeyName = 'key';

describe('When updating an item', () => {
  const testKeys = [];

  afterAll(async () => {
    const promises = testKeys.map(async (testKey) => removeHashKeyItem(testKey));
    await Promise.all(promises);
  });

  describe('and item does not have property of [keyName]', () => {
    it('should return a 400 (Bad Request)', () => {
      // ARRANGE
      const itemWithNoKey = {};
      const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName });

      // ACT
      const updateAction = async () => repo.update(itemWithNoKey);

      // ASSERT
      return expect(updateAction())
        .rejects
        .toHaveProperty('statusCode', 400);
    });
  });

  describe('and item does not exist in db', () => {
    it('should return a 404 (Not Found)', async () => {
      // ARRANGE
      const item = await createKeyValueItem();
      const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName });

      // ACT
      const updateAction = async () => repo.update(item);

      // ASSERT
      await expect(updateAction())
        .rejects
        .toHaveProperty('statusCode', 404);
    });
  });

  it('should maintain original createdAt value', async () => {
    // ARRANGE
    const item = await createKeyValueItem();
    const originalCreatedAt = item.createdAt;
    const key = await insertHashKeyItem(item);
    testKeys.push(key);
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName });

    // ACT
    const result = await repo.update(item);

    // ASSERT
    expect(result.createdAt).toEqual(originalCreatedAt);
  });

  it('should change original updatedAt value', async () => {
    // ARRANGE
    const item = await createKeyValueItem();
    const key = await insertHashKeyItem(item);
    testKeys.push(key);
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName });

    // ACT
    const result = await repo.update(item);

    // ASSERT
    expect(result.updatedAt).not.toEqual(item.updatedAt);
  });

  it('should update revision value', async () => {
    // ARRANGE
    const item = await createKeyValueItem();
    const key = await insertHashKeyItem(item);
    testKeys.push(key);
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName });

    // ACT
    const result = await repo.update(item);

    // ASSERT
    expect(result.revision).toEqual(item.revision + 1);
  });

  describe('and createdAt field is modified', () => {
    it('should throw 409 (Conflict)', async () => {
      // ARRANGE
      const item = await createKeyValueItem();
      const key = await insertHashKeyItem(item);
      testKeys.push(key);
      const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName });
      item.createdAt = faker.date.past();
      // ACT
      const updateAction = () => repo.update(item);

      // ASSERT
      await expect(updateAction())
        .rejects
        .toHaveProperty('statusCode', 409);
    });
  });

  describe('and revision is off', () => {
    it('should throw 409 (Conflict)', async () => {
      // ARRANGE
      const item = await createKeyValueItem();
      const oldRevision = item.revision - 1;
      const key = await insertHashKeyItem(item);
      testKeys.push(key);
      const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName });
      item.revision = oldRevision;
      // ACT
      const updateAction = () => repo.update(item);

      // ASSERT
      await expect(updateAction())
        .rejects
        .toHaveProperty('statusCode', 409);
    });
  });
});
