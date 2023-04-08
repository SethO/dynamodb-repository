const KeyValueRepository = require('../lib/keyValueRepository');

describe('When instantiating hashKey repository', () => {
  it('should store table name', () => {
    // ARRANGE
    const tableName = 'myTableName';

    // ACT
    const repo = new KeyValueRepository({ tableName, keyName: 'x' });

    // ASSERT
    expect(repo.tableName).toEqual(tableName);
  });

  it('should store keyName', () => {
    // ARRANGE
    const keyName = 'myKeyName';

    // ACT
    const repo = new KeyValueRepository({ tableName: 'x', keyName });

    // ASSERT
    expect(repo.keyName).toEqual(keyName);
  });

  it('should allow injected DocumentClient', () => {
    // ARRANGE
    const keyName = 'x';
    const tableName = 'x';
    const documentClient = { a: 'a', b: 'b', c: () => 'c' };

    // ACT
    const repo = new KeyValueRepository({ tableName, keyName, documentClient });

    // ASSERT
    expect(repo.dynamoDb).toEqual(documentClient);
  });

  describe('and validator fails validation', () => {
    it('should throw error', () => {
      // ARRANGE
      const tableName = undefined;
      const keyName = 'something';

      // ACT
      const constructorAction = () => new KeyValueRepository({ tableName, keyName });

      // ASSERT
      expect(constructorAction).toThrow(/bad request/i);
    });
  });
});
