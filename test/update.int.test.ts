import { faker } from '@faker-js/faker';

import {
  removeHashKeyItem,
  createTestKeyValueItem,
  insertHashKeyItem,
} from './integrationTestUtils';
import KeyValueRepository from '../lib/keyValueRepository';
import getDocumentClient from './documentClient';

const TableName = 'HashKeyTestDB';
const KeyName = 'key';

describe('When updating an item', () => {
  const testKeys: string[] = [];
  const documentClient = getDocumentClient();

  afterAll(async () => {
    const promises = testKeys.map(async (testKey) => removeHashKeyItem(testKey));
    await Promise.all(promises);
  });

  describe('and item does not have property of [keyName]', () => {
    it('should return a 400 (Bad Request)', () => {
      // ARRANGE
      const itemWithNoKey = {};
      const repo = new KeyValueRepository({
        tableName: TableName,
        keyName: KeyName,
        documentClient,
      });

      // ACT
      const updateAction = async () => repo.update(itemWithNoKey);

      // ASSERT
      return expect(updateAction()).rejects.toHaveProperty('statusCode', 400);
    });
  });

  describe('and item does not exist in db', () => {
    it('should return a 404 (Not Found)', async () => {
      // ARRANGE
      const item = createTestKeyValueItem();
      const repo = new KeyValueRepository({
        tableName: TableName,
        keyName: KeyName,
        documentClient,
      });

      // ACT
      const updateAction = async () => repo.update(item);

      // ASSERT
      await expect(updateAction()).rejects.toHaveProperty('statusCode', 404);
    });
  });

  it('should update the item in db', async () => {
    // ARRANGE
    const item = createTestKeyValueItem();
    const key = await insertHashKeyItem(item);
    testKeys.push(key);
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName, documentClient });
    const newField1 = faker.lorem.slug();

    // ACT
    const result = await repo.update({ ...item, field1: newField1 });

    // ASSERT
    expect(result.field1).toEqual(newField1);
  });

  it('should maintain original createdAt value', async () => {
    // ARRANGE
    const item = createTestKeyValueItem();
    const originalCreatedAt = item.createdAt;
    const key = await insertHashKeyItem(item);
    testKeys.push(key);
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName, documentClient });

    // ACT
    const result = await repo.update(item);

    // ASSERT
    expect(result.createdAt).toEqual(originalCreatedAt);
  });

  it('should change original updatedAt value', async () => {
    // ARRANGE
    const item = createTestKeyValueItem();
    const key = await insertHashKeyItem(item);
    testKeys.push(key);
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName, documentClient });

    // ACT
    const result = await repo.update(item);

    // ASSERT
    expect(result.updatedAt).not.toEqual(item.updatedAt);
  });

  it('should update revision value', async () => {
    // ARRANGE
    const item = createTestKeyValueItem();
    const key = await insertHashKeyItem(item);
    testKeys.push(key);
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName, documentClient });

    // ACT
    const result = await repo.update(item);

    // ASSERT
    expect(result.revision).toEqual(item.revision + 1);
  });

  describe('and revision is off', () => {
    it('should throw 409 (Conflict)', async () => {
      // ARRANGE
      const item = createTestKeyValueItem();
      const oldRevision = item.revision - 1;
      const key = await insertHashKeyItem(item);
      testKeys.push(key);
      const repo = new KeyValueRepository({
        tableName: TableName,
        keyName: KeyName,
        documentClient,
      });
      item.revision = oldRevision;
      // ACT
      const updateAction = () => repo.update(item);

      // ASSERT
      await expect(updateAction()).rejects.toHaveProperty('statusCode', 409);
      await expect(updateAction()).rejects.toThrow(`${oldRevision}`);
      await expect(updateAction()).rejects.toThrow(`${item.revision}`);
    });
  });
});
