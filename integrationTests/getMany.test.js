const { removeHashKeyItem, insertNumberOfHashKeyItems } = require('./integrationTestUtils');
const { HashKeyRepository } = require('../index');
const { parseCursor } = require('../lib/utils');

const TableName = 'HashKeyTestDB';
const HashKeyName = 'key';

describe('When calling GetMany()', () => {
  const testKeys = [];

  afterAll(async () => {
    const promises = testKeys.map(async testKey => removeHashKeyItem(testKey));
    await Promise.all(promises);
  });

  it('should return array', async () => {
    // ARRANGE
    const repo = new HashKeyRepository({ tableName: TableName, hashKeyName: HashKeyName });

    // ACT
    const result = await repo.getMany();

    // ASSERT
    expect(result.items).toEqual(expect.any(Array));
  });
});

describe('When using curosr', () => {
  const testKeys = [];

  afterAll(async () => {
    const promises = testKeys.map(async testKey => removeHashKeyItem(testKey));
    await Promise.all(promises);
  });

  it('should respect cursor', async () => {
    // ARRANGE
    const keys = await insertNumberOfHashKeyItems(4);
    testKeys.push(...keys);
    const repo = new HashKeyRepository({ tableName: TableName, hashKeyName: HashKeyName });

    // ACT
    const firstResult = await repo.getMany({ limit: 2 });
    const secondResult = await repo.getMany({ limit: 2, cursor: firstResult.cursor });

    // ASSERT
    const parsedCursor = parseCursor(firstResult.cursor);
    expect(firstResult.items).toContainEqual(
      expect.objectContaining({ key: parsedCursor.key }),
    );
    expect(secondResult.items).not.toContainEqual(
      expect.objectContaining({ key: parsedCursor.key }),
    );
  });
});
