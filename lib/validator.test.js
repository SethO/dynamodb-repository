const Joi = require('joi');
const sinon = require('sinon');
const validator = require('./validator');

describe('When validating hash key repository constructor', () => {
  it('should call Joi validate', () => {
    // ARRANGE
    const joiValidateStub = sinon.stub(Joi, 'validate').returns({});

    // ACT
    validator.hashKeyRepoConstructor({});

    // ASSERT
    expect(joiValidateStub.calledOnce).toBeTrue();
    joiValidateStub.restore();
  });

  it('should pass constructor args to validate method', () => {
    // ARRANGE
    const joiValidateStub = sinon.stub(Joi, 'validate').returns({});
    const constructorArgs = {
      tableName: 'tableNameValue',
      hashKeyName: 'hashKeyNameValue',
    };

    // ACT
    validator.hashKeyRepoConstructor(constructorArgs);

    // ASSERT
    expect(joiValidateStub.calledWith(constructorArgs)).toBeTrue();
    joiValidateStub.restore();
  });

  describe('with missing table name', () => {
    it('should throw', () => {
      // ARRANGE
      const constructorArgs = { hashKeyName: 'someHashKeyName' };

      // ACT
      const validationAction = () => validator.hashKeyRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrow();
    });

    it('should contain "tableName" in error message', () => {
      // ARRANGE
      const constructorArgs = { hashKeyName: 'someHashKeyName' };

      // ACT
      const validationAction = () => validator.hashKeyRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrowWithMessage(Error, /tableName/);
    });
  });
  
  describe('with missing hash key name', () => {
    it('should throw', () => {
      // ARRANGE
      const constructorArgs = { tableName: 'someTableName' };

      // ACT
      const validationAction = () => validator.hashKeyRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrow();
    });

    it('should contain "hashKeyName" in error message', () => {
      // ARRANGE
      const constructorArgs = { tableName: 'someTableName' };

      // ACT
      const validationAction = () => validator.hashKeyRepoConstructor(constructorArgs);

      // ASSERT
      expect(validationAction).toThrowWithMessage(Error, /hashKeyName/);
    });
  });
});
