import { UpdateExpressionsBuilder } from '../lib/updateExpressionBuilder';

describe('When building an update expression', () => {
  describe('with primitive-only properties', () => {
    it('should return an expression builder result', () => {
      // ARRANGE
      const item = { id: 'x', name: 'Francisco', age: 31, isCool: true };
      const builder = new UpdateExpressionsBuilder('id');

      // ACT
      const updateExpression = builder.buildUpdateExpression(item);

      // ASSERT
      expect(updateExpression).not.toBeEmpty();
      expect(updateExpression).toBeString();
    });

    it('should add "#prop_[index]" for each property', () => {
      // ARRANGE
      const item = { id: 'x', name: 'Francisco', age: 31, isCool: true };
      const builder = new UpdateExpressionsBuilder('id');

      // ACT
      const updateExpression = builder.buildUpdateExpression(item);

      // ASSERT
      expect(updateExpression).toContain('#prop_0');
      expect(updateExpression).toContain('#prop_1');
      expect(updateExpression).toContain('#prop_2');
    });

    it('should add ":value_[index]" for each property', () => {
      // ARRANGE
      const item = { id: 'x', name: 'Francisco', age: 31, isCool: true };
      const builder = new UpdateExpressionsBuilder('id');

      // ACT
      const updateExpression = builder.buildUpdateExpression(item);

      // ASSERT
      expect(updateExpression).toContain(':value_0');
      expect(updateExpression).toContain(':value_1');
      expect(updateExpression).toContain(':value_2');
    });

    it('should remove the key property from the props', () => {
      // ARRANGE
      const item = { id: 'x', name: 'Francisco', age: 31, isCool: true };
      const builder = new UpdateExpressionsBuilder('id');

      // ACT
      const updateExpression = builder.buildUpdateExpression(item);

      // ASSERT
      expect(updateExpression).not.toContain('#prop_3');
    });

    it('should remove the key property from the values', () => {
      // ARRANGE
      const item = { id: 'x', name: 'Francisco', age: 31, isCool: true };
      const builder = new UpdateExpressionsBuilder('id');

      // ACT
      const updateExpression = builder.buildUpdateExpression(item);

      // ASSERT
      expect(updateExpression).not.toContain(':value_3');
    });
  });

  describe('with an array property', () => {
    it('should add "#prop_[index]" for the array', () => {
      // ARRANGE
      const item = {
        id: 'x',
        name: 'Francisco',
        age: 31,
        isCool: true,
        pursuits: ['philosophy', 'physics', 'mining'],
      };
      const builder = new UpdateExpressionsBuilder('id');

      // ACT
      const updateExpression = builder.buildUpdateExpression(item);

      // ASSERT
      expect(updateExpression).toContain('#prop_3');
    });

    it('should add ":value_[index]" for the array', () => {
      // ARRANGE
      const item = {
        id: 'x',
        name: 'Francisco',
        age: 31,
        isCool: true,
        pursuits: ['philosophy', 'physics', 'mining'],
      };
      const builder = new UpdateExpressionsBuilder('id');

      // ACT
      const updateExpression = builder.buildUpdateExpression(item);

      // ASSERT
      expect(updateExpression).toContain(':value_3');
    });
  });

  describe('with a map property', () => {
    it('should add "#prop_[index]" for the map', () => {
      // ARRANGE
      const item = {
        id: 'x',
        name: 'Francisco',
        age: 31,
        isCool: true,
        company: { location: 'Argentina' },
      };
      const builder = new UpdateExpressionsBuilder('id');

      // ACT
      const updateExpression = builder.buildUpdateExpression(item);

      // ASSERT
      expect(updateExpression).toContain('#prop_3');
    });

    it('should add ":value_[index]" for the map', () => {
      // ARRANGE
      const item = {
        id: 'x',
        name: 'Francisco',
        age: 31,
        isCool: true,
        company: { location: 'Argentina' },
      };
      const builder = new UpdateExpressionsBuilder('id');

      // ACT
      const updateExpression = builder.buildUpdateExpression(item);

      // ASSERT
      expect(updateExpression).toContain(':value_3');
    });
  });
});

describe('When building update expression names', () => {
  describe('with primitive-only properties', () => {
    it('should correctly build Attribute Names', () => {
      // ARRANGE
      const item = { id: 'x', name: 'Francisco', age: 31, isCool: true };
      const builder = new UpdateExpressionsBuilder('id');

      // ACT
      const expressionAttributeNames = builder.buildExpressionNames(item);

      // ASSERT
      expect(expressionAttributeNames['#prop_0']).toEqual('name');
      expect(expressionAttributeNames['#prop_1']).toEqual('age');
      expect(expressionAttributeNames['#prop_2']).toEqual('isCool');
    });

    it('should not include the key property', () => {
      // ARRANGE
      const item = { id: 'x', name: 'Francisco', age: 31, isCool: true };
      const builder = new UpdateExpressionsBuilder('id');

      // ACT
      const expressionAttributeNames = builder.buildExpressionNames(item);

      // ASSERT
      const values = Object.values(expressionAttributeNames);
      expect(values).not.toContain('id');
    });
  });
});

describe('When building update expression values', () => {
  describe('with primitive-only properties', () => {
    it('should correctly build Attribute Values', () => {
      // ARRANGE
      const item = { id: 'x', name: 'Francisco', age: 31, isCool: true };
      const builder = new UpdateExpressionsBuilder('id');

      // ACT
      const expressionAttributeValues = builder.buildExpressionValues(item);

      // ASSERT
      expect(expressionAttributeValues[':value_0']).toEqual(item.name);
      expect(expressionAttributeValues[':value_1']).toEqual(item.age);
      expect(expressionAttributeValues[':value_2']).toEqual(item.isCool);
    });

    it('should not include the key value', () => {
      // ARRANGE
      const item = { id: 'xyz', name: 'Francisco', age: 31, isCool: true };
      const builder = new UpdateExpressionsBuilder('id');

      // ACT
      const expressionAttributeValues = builder.buildExpressionValues(item);

      // ASSERT
      const values = Object.values(expressionAttributeValues);
      expect(values).not.toContain('xyz');
    });
  });

  describe('with an array property', () => {
    it('should correctly build Attribute Values', () => {
      // ARRANGE
      const item = {
        id: 'x',
        name: 'Francisco',
        age: 31,
        isCool: true,
        pursuits: ['philosophy', 'physics', 'mining'],
      };
      const builder = new UpdateExpressionsBuilder('id');

      // ACT
      const expressionAttributeValues = builder.buildExpressionValues(item);

      // ASSERT
      expect(expressionAttributeValues[':value_3']).toEqual(item.pursuits);
    });
  });

  describe('with a map property', () => {
    it('should correctly build Attribute Values', () => {
      // ARRANGE
      const item = {
        id: 'x',
        name: 'Francisco',
        age: 31,
        isCool: true,
        company: { location: 'Argentina' },
      };
      const builder = new UpdateExpressionsBuilder('id');

      // ACT
      const expressionAttributeValues = builder.buildExpressionValues(item);

      // ASSERT
      expect(expressionAttributeValues[':value_3']).toEqual(item.company);
    });
  });
});
