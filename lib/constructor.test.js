const sinon = require('sinon');
const KeyValueRepository = require('./keyValueRepository');
const validate = require('./validator');

describe('When instantiating hashKey repository', () => {
  let validateStub;
  beforeEach(() => {
    validateStub = sinon.stub(validate, 'keyValueRepoConstructor');
  });

  afterEach(() => {
    validateStub.restore();
  });

  it('should store table name', () => {
    // ARRANGE
    const tableName = 'myTableName';

    // ACT
    const repo = new KeyValueRepository({ tableName });

    // ASSERT
    expect(repo.tableName).toEqual(tableName);
  });

  it('should store keyName', () => {
    // ARRANGE
    const keyName = 'myKeyName';
    const tableName = 'nothing';

    // ACT
    const repo = new KeyValueRepository({ tableName, keyName });

    // ASSERT
    expect(repo.keyName).toEqual(keyName);
  });

  it('should allow injected DocumentClient', () => {
    // ARRANGE
    const keyName = 'x';
    const tableName = 'x';
    const documentClient = { a: 'a', b: 'b', c: () => ('c') };

    // ACT
    const repo = new KeyValueRepository({ tableName, keyName, documentClient });

    // ASSERT
    expect(repo.dynamoDb).toEqual(documentClient);
  });

  it('should call validator', () => {
    // ARRANGE
    const tableName = undefined;
    const keyName = 'something';

    // ACT
    // eslint-disable-next-line no-new
    new KeyValueRepository({ tableName, keyName });

    // ASSERT
    expect(validateStub.calledOnce).toBeTrue();
  });

  describe('and validator fails validation', () => {
    it('should throw error', () => {
      // ARRANGE
      const tableName = undefined;
      const keyName = 'something';
      validateStub.throws('BAM');

      // ACT
      const contructorAction = () => new KeyValueRepository({ tableName, keyName });

      // ASSERT
      expect(contructorAction).toThrow();
    });
  });
});
