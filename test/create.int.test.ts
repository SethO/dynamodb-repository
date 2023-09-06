import retry from 'async-retry';
import {
  removeHashKeyItem,
  createTestKeyValueItem,
  fetchHashKeyItem,
} from './integrationTestUtils';
import getDocumentClient from './documentClient';
import KeyValueRepository from '../lib/keyValueRepository';

const TableName = 'HashKeyTestDB';
const KeyName = 'key';

describe('When creating item', () => {
  const testKeys: string[] = [];
  const documentClient = getDocumentClient();

  afterAll(async () => {
    const promises = testKeys.map(async (testKey) => removeHashKeyItem(testKey));
    await Promise.all(promises);
  });

  it('should save item to db', async () => {
    // ARRANGE
    const item = await createTestKeyValueItem();
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName, documentClient });

    // ACT
    const { key } = await repo.create(item);
    testKeys.push(key);

    // ASSERT
    await retry(async () => {
      const itemFromDB = await fetchHashKeyItem(key);
      expect(itemFromDB).not.toBeUndefined();
      expect(itemFromDB?.field1).toEqual(item.field1);
    }, { retries: 3 });
  });

  it('should replace any id on provided item', async () => {
    // ARRANGE
    const item = await createTestKeyValueItem();
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName, documentClient });

    // ACT
    const { key } = await repo.create(item);
    testKeys.push(key);

    // ASSERT
    await retry(async () => {
      expect(key).not.toEqual(item.key);
      const itemFromDB = await fetchHashKeyItem(key);
      expect(itemFromDB?.key).not.toEqual(item.key);
    }, { retries: 3 });
  });

  it('should set createdAt and updateAt', async () => {
    // ARRANGE
    const item = await createTestKeyValueItem();
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName, documentClient });

    // ACT
    const result = await repo.create(item);
    testKeys.push(result.key);

    // ASSERT
    await retry(async () => {
      expect(result.createdAt).not.toBeUndefined();
      expect(result.createdAt).toEqual(result.updatedAt);
      const itemFromDB = await fetchHashKeyItem(result.key);
      expect(itemFromDB?.createdAt).not.toBeUndefined();
      expect(itemFromDB?.createdAt).toEqual(itemFromDB?.updatedAt);
    }, { retries: 3 });
  });

  describe('with a idOption prefix', () => {
    it('item id should start with prefix', async () => {
      // ARRANGE
      const item = await createTestKeyValueItem();
      const prefix = 'itm_';
      const repo = new KeyValueRepository({
        tableName: TableName,
        keyName: KeyName,
        idOptions: {
          prefix,
        },
        documentClient,
      });

      // ACT
      const { key } = await repo.create(item);
      testKeys.push(key);

      await retry(async () => {
        // ASSERT
        const itemFromDB = await fetchHashKeyItem(key);
        expect(itemFromDB?.[KeyName]).toStartWith(prefix);
      }, { retries: 3 });
    });
  });
});
