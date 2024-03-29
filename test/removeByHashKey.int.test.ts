import {
  insertHashKeyItem,
  removeHashKeyItem,
  fetchHashKeyItem,
} from './integrationTestUtils';
import getDocumentClient from './documentClient';
import KeyValueRepository from '../lib/keyValueRepository';

const TableName = 'HashKeyTestDB';
const KeyName = 'key';
const documentClient = getDocumentClient();

describe('When removing by hash key', () => {
  const testKeys: string[] = [];

  afterAll(async () => {
    const promises = testKeys.map(async (testKey) => removeHashKeyItem(testKey));
    await Promise.all(promises);
  });

  it('should remove item', async () => {
    // ARRANGE
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName, documentClient });
    const key = await insertHashKeyItem();
    testKeys.push(key);

    // ACT
    await repo.remove(key);

    // ASSERT
    const fetchResult = await fetchHashKeyItem(key);
    expect(fetchResult).toBeUndefined();
  });

  describe('and hash key does not exist', () => {
    it('should no-op', async () => {
      // ARRANGE
      const repo = new KeyValueRepository({
        tableName: TableName,
        keyName: KeyName,
        documentClient,
      });

      // ACT
      const removeAction = async () => repo.remove('some-key-that-does-not-exist');

      // ASSERT
      await expect(removeAction()).toResolve();
    });
  });
});
