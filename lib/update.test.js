const { faker } = require('@faker-js/faker');
const KeyValueRepository = require('./keyValueRepository');

describe('When updating item', () => {
  describe('and item does not have property of [keyName]', () => {
    it('should throw Bad Request', () => {
      // ARRANGE
      const keyName = faker.lorem.word();
      const itemWithNoKeyName = {};
      const repo = new KeyValueRepository({ tableName: 'x', keyName });

      // ACT
      const updateAction = () => repo.update(itemWithNoKeyName);

      // ASSERT
      return expect(updateAction()).rejects.toHaveProperty('statusCode', 400);
    });
  });
});
