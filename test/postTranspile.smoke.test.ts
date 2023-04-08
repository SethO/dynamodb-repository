import { faker } from '@faker-js/faker'

import {
  removeHashKeyItem,
  createKeyValueItem,
  fetchHashKeyItem,
  insertHashKeyItem,
} from './integrationTestUtils';
import getDocumentClient from './documentClient';

const { KeyValueRepository } = require('../.build/index.js');

const TableName = 'HashKeyTestDB';
const KeyName = 'key';

describe('When testing transpiled code', () => {
  const testKeys: string[] = [];
  const documentClient = getDocumentClient();

  afterAll(async () => {
    const promises = testKeys.map(async (testKey) => removeHashKeyItem(testKey));
    await Promise.all(promises);
  });

  it('should create', async () => {
    // ARRANGE
    const item = await createKeyValueItem();
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName, documentClient });

    // ACT
    const { key } = await repo.create(item);
    testKeys.push(key);

    // ASSERT
    const itemFromDB = await fetchHashKeyItem(key);
    expect(itemFromDB).not.toBeUndefined();
  });

  it('should get', async () => {
    // ARRANGE
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName, documentClient });
    const key = await insertHashKeyItem();
    testKeys.push(key);

    // ACT
    const result = await repo.get(key);

    // ASSERT
    expect(result.key).toEqual(key);
  });

  it('should get many', async () => {
    // ARRANGE
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName, documentClient });

    // ACT
    const result = await repo.getMany();

    // ASSERT
    expect(result.items).toEqual(expect.any(Array));
  });

  it('should delete', async () => {
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

  it('should update', async () => {
    // ARRANGE
    const item = await createKeyValueItem();
    const key = await insertHashKeyItem(item);
    testKeys.push(key);
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName, documentClient });
    const newField1 = faker.lorem.slug();

    // ACT
    const result = await repo.update({ ...item, field1: newField1 });

    // ASSERT
    expect(result.field1).toEqual(newField1);
  });
});