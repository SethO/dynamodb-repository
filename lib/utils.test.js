const faker = require('faker');
const { createCursor, parseCursor } = require('./utils');

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
});
