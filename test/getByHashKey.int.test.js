const { faker } = require('@faker-js/faker');
const { insertHashKeyItem, removeHashKeyItem } = require('./integrationTestUtils');
const { KeyValueRepository } = require('../index');

const TableName = 'HashKeyTestDB';
const KeyName = 'key';

describe('When getting by hash key', () => {
  const testKeys = [];

  afterAll(async () => {
    const promises = testKeys.map(async (testKey) => removeHashKeyItem(testKey));
    await Promise.all(promises);
  });

  it('should fetch item', async () => {
    // ARRANGE
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName });
    const key = await insertHashKeyItem();
    testKeys.push(key);

    // ACT
    const result = await repo.get(key);

    // ASSERT
    expect(result.key).toEqual(key);
  });

  describe('and key is not in db', () => {
    it('should throw 404', async () => {
      const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName });
      const fakeKey = faker.datatype.uuid();

      // ACT/ASSERT
      await expect(repo.get(fakeKey)).rejects.toThrow(`No ${KeyName} found`);
    });

    it('should contain key in error message', async () => {
      const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName });
      const fakeKey = faker.datatype.uuid();

      // ACT/ASSERT
      await expect(repo.get(fakeKey)).rejects.toThrow(fakeKey);
    });
  });
});
