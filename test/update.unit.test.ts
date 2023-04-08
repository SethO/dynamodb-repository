import { faker } from '@faker-js/faker';
import KeyValueRepository from '../lib/keyValueRepository';
import getDocumentClient from './documentClient';

describe('When updating item', () => {
  const documentClient = getDocumentClient();
  
  describe('and item does not have property of [keyName]', () => {
    it('should throw Bad Request', () => {
      // ARRANGE
      const keyName = faker.lorem.word();
      const itemWithNoKeyName = {};
      const repo = new KeyValueRepository({ tableName: 'x', keyName, documentClient });

      // ACT
      const updateAction = () => repo.update(itemWithNoKeyName);

      // ASSERT
      return expect(updateAction()).rejects.toHaveProperty('statusCode', 400);
    });
  });
});
