import { ConstructorArgs } from '../lib/types';
import keyValueRepoConstructor from '../lib/validator';
import getDocumentClient from './documentClient';

describe('When validating hash key repository constructor', () => {
  const documentClient = getDocumentClient();
  describe('with correct fields', () => {
    it('should no-op', () => {
      // ARRANGE
      const constructorArgs: ConstructorArgs = {
        tableName: 'x',
        keyName: 'x',
        documentClient,
      };

      // ACT
      const validateAction = () => keyValueRepoConstructor(constructorArgs);

      // ASSERT
      expect(validateAction).not.toThrow();
    });
  });

  describe('with empty table name', () => {
    it('should throw', () => {
      // ARRANGE
      const constructorArgs: ConstructorArgs = {
        keyName: 'someKeyName',
        tableName: '',
        documentClient,
      };

      // ACT
      const validationAction = () => keyValueRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrow();
    });

    it('should contain "tableName" in error message', () => {
      // ARRANGE
      const constructorArgs: ConstructorArgs = {
        keyName: 'someKeyName',
        tableName: '',
        documentClient,
      };

      // ACT
      const validationAction = () => keyValueRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrow(/tableName/i);
    });
  });

  describe('with missing hash key name', () => {
    it('should throw', () => {
      // ARRANGE
      const constructorArgs: ConstructorArgs = {
        tableName: 'someTableName',
        keyName: '',
        documentClient,
      };

      // ACT
      const validationAction = () => keyValueRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrow();
    });

    it('should contain "keyName" in error message', () => {
      // ARRANGE
      const constructorArgs: ConstructorArgs = {
        tableName: 'someTableName',
        keyName: '',
        documentClient,
      };

      // ACT
      const validationAction = () => keyValueRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrow(/keyName/i);
    });
  });

  describe('with missing document client', () => {
    it('should throw', () => {
      // ARRANGE
      const constructorArgs = { tableName: 'x', keyName: 'x' } as ConstructorArgs;

      // ACT
      const validationAction = () => keyValueRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrow(/documentClient/i);
    });
  });
});
