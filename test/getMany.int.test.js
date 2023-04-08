const { removeHashKeyItem, insertNumberOfHashKeyItems } = require('./integrationTestUtils');
const { KeyValueRepository } = require('../index');
const { parseCursor } = require('../lib/utils');
const getDynamoDbClient = require('./documentClient');

const TableName = 'HashKeyTestDB';
const KeyName = 'key';
const documentClient = getDynamoDbClient();

describe('When calling GetMany()', () => {
  const testKeys = [];

  afterAll(async () => {
    const promises = testKeys.map(async (testKey) => removeHashKeyItem(testKey));
    await Promise.all(promises);
  });

  it('should return array', async () => {
    // ARRANGE
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName, documentClient });

    // ACT
    const result = await repo.getMany();

    // ASSERT
    expect(result.items).toEqual(expect.any(Array));
  });
});

describe('When scan returns a cursor', () => {
  const testKeys = [];

  afterAll(async () => {
    const promises = testKeys.map(async (testKey) => removeHashKeyItem(testKey));
    await Promise.all(promises);
  });

  it('should find cursor key in first fetch, but not second', async () => {
    // ARRANGE
    const keys = await insertNumberOfHashKeyItems(4);
    testKeys.push(...keys);
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName, documentClient });

    // ACT
    const firstResult = await repo.getMany({ limit: 2 });
    const secondResult = await repo.getMany({ limit: 2, cursor: firstResult.cursor });

    // ASSERT
    const parsedCursor = parseCursor(firstResult.cursor);
    expect(firstResult.items).toContainEqual(expect.objectContaining({ key: parsedCursor.key }));
    expect(secondResult.items).not.toContainEqual(
      expect.objectContaining({ key: parsedCursor.key }),
    );
  });
});

describe('When fetching all with cursor', () => {
  const testKeys = [];

  afterAll(async () => {
    const promises = testKeys.map(async (testKey) => removeHashKeyItem(testKey));
    await Promise.all(promises);
  });

  it('should fetch until no curor is returned', async () => {
    // ARRANGE
    const keys = await insertNumberOfHashKeyItems(4);
    testKeys.push(...keys);
    const repo = new KeyValueRepository({ tableName: TableName, keyName: KeyName, documentClient });
    const allItems = [];
    const getAllItems = async ({ limit = 2, cursor = null }) => {
      const getResult = await repo.getMany({ limit, cursor });
      allItems.push(...getResult.items);
      if (getResult.cursor) {
        await getAllItems({ cursor: getResult.cursor });
      }
    };

    // ACT
    await getAllItems({});

    // ASSERT
    expect(allItems.length).toBeGreaterThanOrEqual(4);
  });
});
