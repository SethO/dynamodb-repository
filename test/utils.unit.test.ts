import { faker } from '@faker-js/faker';
import { createCursor, parseCursor, createId } from '../lib/utils';

describe('When creating cursor', () => {
  describe('from a string', () => {
    it('should result in a string', () => {
      // ARRANGE
      const originalStringCursor = faker.datatype.uuid();

      // ACT
      const result = createCursor(originalStringCursor);

      // ASSERT
      expect(result).toBeString();
    });
  });

  describe('from an integer', () => {
    it('should result in a string', () => {
      // ARRANGE
      const originalNumberCursor = faker.datatype.number() as unknown;

      // ACT
      const result = createCursor(originalNumberCursor as string);

      // ASSERT
      expect(result).toBeString();
    });
  });

  describe('from an object', () => {
    it('should result in a string', () => {
      // ARRANGE
      const originalObjectCursor = {};

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
      const originalStringValue = faker.datatype.uuid();
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
      const originalNumberValue = faker.datatype.number().toString();
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
      const badCursor = true as unknown;

      // ACT
      const parseCursorAction = () => parseCursor(badCursor as string);

      // ASSERT
      expect(parseCursorAction).toThrow(/bad request/i);
    });
  });
});

describe('When creating id', () => {
  it('should result in a string', async () => {
    // ARRANGE
    // ACT
    const id = await createId();

    // ASSERT
    expect(id).toBeString();
  });

  describe('with a prefix', () => {
    it('should return id that begins with prefix', async () => {
      // ARRANGE
      const prefix = 'cat';

      // ACT
      const id = await createId({ prefix });

      // ASSERT
      expect(id).toStartWith(prefix);
    });
  });

  describe('with a number prefix', () => {
    it('should return string id that begins with prefix', async () => {
      // ARRANGE
      const prefix = '900';

      // ACT
      const id = await createId({ prefix });

      // ASSERT
      expect(id).toBeString();
      expect(id).toStartWith(prefix.toString());
    });
  });
});
