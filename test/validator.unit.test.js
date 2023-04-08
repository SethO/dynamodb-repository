const validator = require('../lib/validator');

describe('When validating hash key repository constructor', () => {
  describe('with correct fields', () => {
    it('should no-op', () => {
      // ARRANGE
      const constructorArgs = {
        tableName: 'x',
        keyName: 'x',
        documentClient: {},
      };

      // ACT
      const validateAction = () => validator.keyValueRepoConstructor(constructorArgs);

      // ASSERT
      expect(validateAction).not.toThrow();
    });
  });

  describe('with missing table name', () => {
    it('should throw', () => {
      // ARRANGE
      const constructorArgs = { keyName: 'someKeyName' };

      // ACT
      const validationAction = () => validator.keyValueRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrow();
    });

    it('should contain "tableName" in error message', () => {
      // ARRANGE
      const constructorArgs = { keyName: 'someKeyName' };

      // ACT
      const validationAction = () => validator.keyValueRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrowWithMessage(Error, /tableName/);
    });
  });

  describe('with missing hash key name', () => {
    it('should throw', () => {
      // ARRANGE
      const constructorArgs = { tableName: 'someTableName' };

      // ACT
      const validationAction = () => validator.keyValueRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrow();
    });

    it('should contain "keyName" in error message', () => {
      // ARRANGE
      const constructorArgs = { tableName: 'someTableName' };

      // ACT
      const validationAction = () => validator.keyValueRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrowWithMessage(Error, /keyName/);
    });
  });

  describe('with missing document client', () => {
    it('should throw', () => {
      // ARRANGE
      const constructorArgs = { tableName: 'x', keyName: 'x' };

      // ACT
      const validationAction = () => validator.keyValueRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrow(/documentClient/i);
    });
  });

  describe('with an idOption prefix with a non token character', () => {
    it('should throw', () => {
      // ARRANGE
      const constructorArgs = {
        tableName: 'x',
        keyName: 'y',
        idOptions: {
          prefix: '/',
        },
      };

      // ACT
      const validationAction = () => validator.keyValueRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrow();
    });

    it('should contain "keyName" in error message', () => {
      // ARRANGE
      const constructorArgs = {
        tableName: 'x',
        keyName: 'y',
        idOptions: {
          prefix: '/',
        },
      };
      // ACT
      const validationAction = () => validator.keyValueRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrowWithMessage(Error, /prefix/);
    });
  });

  describe('with an idOption length of a non-number', () => {
    it('should throw', () => {
      // ARRANGE
      const constructorArgs = {
        tableName: 'x',
        keyName: 'y',
        idOptions: {
          length: 'eleven',
        },
      };

      // ACT
      const validationAction = () => validator.keyValueRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrow();
    });

    it('should contain "keyName" in error message', () => {
      // ARRANGE
      const constructorArgs = {
        tableName: 'x',
        keyName: 'y',
        idOptions: {
          length: 'eleven',
        },
      };
      // ACT
      const validationAction = () => validator.keyValueRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrowWithMessage(Error, /length/);
    });
  });
});
