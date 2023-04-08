const KeyValueRepository = require('../lib/keyValueRepository');

describe('When instantiating hashKey repository', () => {
  it('should store table name', () => {
    // ARRANGE
    const tableName = 'myTableName';

    // ACT
    const repo = new KeyValueRepository({ tableName, keyName: 'x', documentClient: {} });

    // ASSERT
    expect(repo.tableName).toEqual(tableName);
  });

  it('should store keyName', () => {
    // ARRANGE
    const keyName = 'myKeyName';

    // ACT
    const repo = new KeyValueRepository({ tableName: 'x', keyName, documentClient: {} });

    // ASSERT
    expect(repo.keyName).toEqual(keyName);
  });

  describe('and validator fails validation', () => {
    it('should throw error', () => {
      // ARRANGE
      const tableName = undefined;
      const keyName = 'something';

      // ACT
      const constructorAction = () =>
        new KeyValueRepository({ tableName, keyName, documentClient: {} });

      // ASSERT
      expect(constructorAction).toThrow(/bad request/i);
    });
  });
});
