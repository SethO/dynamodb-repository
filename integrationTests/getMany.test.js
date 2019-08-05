const { removeHashKeyItem } = require('./integrationTestUtils');
const { HashKeyRepository } = require('../index');

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
    expect(result).toEqual(expect.any(Array));
  });
});
