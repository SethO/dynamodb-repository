import { faker } from '@faker-js/faker';
import { insertHashKeyItem, removeHashKeyItem } from './integrationTestUtils';
import getDocumentClient from './documentClient';
import KeyValueRepository from '../lib/keyValueRepository';

const TableName = 'HashKeyTestDB';
const KeyName = 'key';

describe('When getting by hash key', () => {
  const testKeys: string[] = [];
  const documentClient = getDocumentClient();

  afterAll(async () => {
    const promises = testKeys.map(async (testKey) => removeHashKeyItem(testKey));
    await Promise.all(promises);
  });

  it('should fetch item', async () => {
    // ARRANGE
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName, documentClient });
    const key = await insertHashKeyItem();
    testKeys.push(key);

    // ACT
    const result = await repo.get(key);

    // ASSERT
    expect(result.key).toEqual(key);
  });

  describe('and key is not in db', () => {
    it('should throw 404', async () => {
      const repo = new KeyValueRepository({
        tableName: TableName,
        keyName: KeyName,
        documentClient,
      });
      const fakeKey = faker.datatype.uuid();

      // ACT/ASSERT
      await expect(repo.get(fakeKey)).rejects.toThrow(`No ${KeyName} found`);
    });

    it('should contain key in error message', async () => {
      const repo = new KeyValueRepository({
        tableName: TableName,
        keyName: KeyName,
        documentClient,
      });
      const fakeKey = faker.datatype.uuid();

      // ACT/ASSERT
      await expect(repo.get(fakeKey)).rejects.toThrow(fakeKey);
    });
  });
});
