const { removeHashKeyItem, createHashKeyItem, fetchHashKeyItem } = require('./integrationTestUtils');
const { KeyValueRepository } = require('../index');

const TableName = 'HashKeyTestDB';
const KeyName = 'key';

describe('When creating item', () => {
  const testKeys = [];

  afterAll(async () => {
    const promises = testKeys.map(async (testKey) => removeHashKeyItem(testKey));
    await Promise.all(promises);
  });

  it('should save item to db', async () => {
    // ARRANGE
    const item = await createHashKeyItem();
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName });

    // ACT
    const { key } = await repo.create(item);
    testKeys.push(key);

    // ASSERT
    const itemFromDB = await fetchHashKeyItem(key);
    expect(itemFromDB).not.toBeUndefined();
  });

  it('should replace any id on provided item', async () => {
    // ARRANGE
    const item = await createHashKeyItem();
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName });

    // ACT
    const { key } = await repo.create(item);
    testKeys.push(key);

    // ASSERT
    expect(key).not.toEqual(item.key);
    const itemFromDB = await fetchHashKeyItem(key);
    expect(itemFromDB.key).not.toEqual(item.key);
  });

  it('should set createdAt and updateAt', async () => {
    // ARRANGE
    const item = await createHashKeyItem();
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName });

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

  describe('with a idOption prefix', () => {
    it('item id should start with prefix', async () => {
      // ARRANGE
      const item = await createHashKeyItem();
      const prefix = 'itm_';
      const repo = new KeyValueRepository({
        tableName: TableName,
        keyName: KeyName,
        idOptions: {
          prefix,
        },
      });

      // ACT
      const { key } = await repo.create(item);
      testKeys.push(key);

      // ASSERT
      const itemFromDB = await fetchHashKeyItem(key);
      expect(itemFromDB[KeyName]).toStartWith(prefix);
    });
  });

  describe('with a idOption length', () => {
    it('item id should have same length', async () => {
      // ARRANGE
      const item = await createHashKeyItem();
      const length = 11;
      const repo = new KeyValueRepository({
        tableName: TableName,
        keyName: KeyName,
        idOptions: {
          length,
        },
      });

      // ACT
      const { key } = await repo.create(item);
      testKeys.push(key);

      // ASSERT
      const itemFromDB = await fetchHashKeyItem(key);
      expect(itemFromDB[KeyName].length).toEqual(length);
    });
  });
});
