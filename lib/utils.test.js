const createError = require('http-errors');
const faker = require('faker');
const { createCursor, parseCursor, createId } = require('./utils');

describe('When creating cursor', () => {
  describe('from a string', () => {
    it('should result in a string', () => {
      // ARRANGE
      const originalStringCursor = faker.random.uuid();

      // ACT
      const result = createCursor(originalStringCursor);

      // ASSERT
      expect(result).toBeString();
    });
  });

  describe('from an integer', () => {
    it('should result in a string', () => {
      // ARRANGE
      const originalNumberCursor = faker.random.number();

      // ACT
      const result = createCursor(originalNumberCursor);

      // ASSERT
      expect(result).toBeString();
    });
  });

  describe('from an object', () => {
    it('should result in a string', () => {
      // ARRANGE
      const originalObjectCursor = faker.helpers.createCard();

      // ACT
      const result = createCursor(originalObjectCursor);

      // ASSERT
      expect(result).toBeString();
    });
  });
});

describe('When parsing cursor', () => {
  describe('with original string value', () => {
    it('should return original value', () => {
      // ARRANGE
      const originalStringValue = faker.random.uuid();
      const encodedCursor = createCursor(originalStringValue);

      // ACT
      const result = parseCursor(encodedCursor);

      // ASSERT
      expect(result).toEqual(originalStringValue);
    });
  });

  describe('with original number value', () => {
    it('should return original value', () => {
      // ARRANGE
      const originalNumberValue = faker.random.number();
      const encodedCursor = createCursor(originalNumberValue);

      // ACT
      const result = parseCursor(encodedCursor);

      // ASSERT
      expect(result).toEqual(originalNumberValue);
    });
  });

  describe('and JSON.parse() throws error', () => {
    it('should return 400', () => {
      // ARRANGE
      JSON.parse = jest.fn().mockImplementationOnce(() => {
        throw Error('boom');
      });

      // ACT
      const parseCursorAction = () => parseCursor('anything');

      // ASSERT
      const expectedError = new createError.BadRequest('cursor is not valid');
      expect(parseCursorAction).toThrow(expectedError);
    });
  });
});

describe('When creating id', () => {
  it('should result in a string', () => {
    // ARRANGE
    // ACT
    const id = createId();

    // ASSERT
    expect(id).toBeString();
  });

  describe('with no length specified', () => {
    it('should return length of 22', () => {
      // ARRANGE
      // ACT
      const id = createId();

      // ASSERT
      expect(id.length).toEqual(22);
    });
  });

  describe('with a specific length', () => {
    it('should return length specified', () => {
      // ARRANGE
      const length = 15;

      // ACT
      const id = createId({ length });

      // ASSERT
      expect(id.length).toEqual(length);
    });
  });

  describe('with a prefix', () => {
    it('should return id that begins with prefix', () => {
      // ARRANGE
      const prefix = 'cat';

      // ACT
      const id = createId({ prefix });

      // ASSERT
      expect(id).toStartWith(prefix);
    });
  });
  
  describe('with a number prefix', () => {
    it('should return string id that begins with prefix', () => {
      // ARRANGE
      const prefix = 900;

      // ACT
      const id = createId({ prefix });

      // ASSERT
      expect(id).toBeString();
      expect(id).toStartWith(prefix);
    });
  });
});
