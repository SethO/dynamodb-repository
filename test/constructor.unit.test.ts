import KeyValueRepository from '../lib/keyValueRepository';
import getDocumentClient from './documentClient';

describe('When instantiating hashKey repository', () => {
  const documentClient = getDocumentClient();

  describe('and validator fails validation', () => {
    it('should throw error', () => {
      // ARRANGE
      const tableName = '';
      const keyName = 'something';

      // ACT
      const constructorAction = () =>
        new KeyValueRepository({ tableName, keyName, documentClient});

      // ASSERT
      expect(constructorAction).toThrow(/bad request/i);
    });
  });
});
