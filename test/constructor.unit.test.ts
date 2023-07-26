import KeyValueRepository from '../lib/keyValueRepository';
import getDocumentClient from './documentClient';

describe('When instantiating hashKey repository', () => {
  const documentClient = getDocumentClient();

  describe('with a prefix that includes a hash symbol', () => {
    it('should succeed', () => {
      // ARRANGE
      const tableName = 'x';
      const keyName = 'x';
      const idOptions = { prefix: 'X#' };

      // ACT
      const constructorAction = () =>
        new KeyValueRepository({ tableName, keyName, idOptions, documentClient });

      // ASSERT
      expect(constructorAction).not.toThrow();
    });
  });

  describe('and validator fails validation', () => {
    it('should throw error', () => {
      // ARRANGE
      const tableName = '';
      const keyName = 'something';

      // ACT
      const constructorAction = () =>
        new KeyValueRepository({ tableName, keyName, documentClient });

      // ASSERT
      expect(constructorAction).toThrow(/bad request/i);
    });
  });
});
