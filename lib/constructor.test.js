const sinon = require('sinon');
const KeyValueRepository = require('./keyValueRepository');
const validate = require('./validator');

describe('When instantiating hashKey repository', () => {
  let validateStub;
  beforeEach(() => {
    validateStub = sinon.stub(validate, 'hashKeyRepoConstructor');
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

  it('should store hashKeyName', () => {
    // ARRANGE
    const hashKeyName = 'myHashKeyName';
    const tableName = 'nothing';

    // ACT
    const repo = new KeyValueRepository({ tableName, hashKeyName });

    // ASSERT
    expect(repo.hashKeyName).toEqual(hashKeyName);
  });

  it('should allow injected DocumentClient', () => {
    // ARRANGE
    const hashKeyName = 'x';
    const tableName = 'x';
    const documentClient = { a: 'a', b: 'b', c: () => ('c') };

    // ACT
    const repo = new KeyValueRepository({ tableName, hashKeyName, documentClient });

    // ASSERT
    expect(repo.dynamoDb).toEqual(documentClient);
  });

  it('should call validator', () => {
    // ARRANGE
    const tableName = undefined;
    const hashKeyName = 'something';

    // ACT
    // eslint-disable-next-line no-new
    new KeyValueRepository({ tableName, hashKeyName });

    // ASSERT
    expect(validateStub.calledOnce).toBeTrue();
  });

  describe('and validator fails validation', () => {
    it('should throw error', () => {
      // ARRANGE
      const tableName = undefined;
      const hashKeyName = 'something';
      validateStub.throws('BAM');

      // ACT
      const contructorAction = () => new KeyValueRepository({ tableName, hashKeyName });

      // ASSERT
      expect(contructorAction).toThrow();
    });
  });
});
