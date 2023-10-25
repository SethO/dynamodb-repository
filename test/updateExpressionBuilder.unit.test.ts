import { updateExpressionBuilder } from '../lib/updateExpressionBuilder';

describe('When building an update expression', () => {
  describe('with primitive-only properties', () => {
    it('should return an expression builder result', () => {
      // ARRANGE
      const item = { name: 'Francisco', age: 31, isCool: true };

      // ACT
      const result = updateExpressionBuilder(item);

      // ASSERT
      expect(result.UpdateExpression).not.toBeEmpty();
      expect(result.ExpressionAttributeNames).toBeObject();
      expect(result.ExpressionAttributeValues).toBeObject();
    });

    it('should add "#field_[index]" for each property', () => {
      // ARRANGE
      const item = { name: 'Francisco', age: 31, isCool: true };

      // ACT
      const result = updateExpressionBuilder(item);

      // ASSERT
      expect(result.UpdateExpression).toContain('#field_0');
      expect(result.UpdateExpression).toContain('#field_1');
      expect(result.UpdateExpression).toContain('#field_2');
    });

    it('should add ":value_[index]" for each property', () => {
      // ARRANGE
      const item = { name: 'Francisco', age: 31, isCool: true };

      // ACT
      const result = updateExpressionBuilder(item);

      // ASSERT
      expect(result.UpdateExpression).toContain(':value_0');
      expect(result.UpdateExpression).toContain(':value_1');
      expect(result.UpdateExpression).toContain(':value_2');
    });

    it('should correctly build Attribute Names', () => {
      // ARRANGE
      const item = { name: 'Francisco', age: 31, isCool: true };

      // ACT
      const { ExpressionAttributeNames } = updateExpressionBuilder(item);

      // ASSERT
      expect(ExpressionAttributeNames['#field_0']).toEqual('name');
      expect(ExpressionAttributeNames['#field_1']).toEqual('age');
      expect(ExpressionAttributeNames['#field_2']).toEqual('isCool');
    });

    it('should correctly build Attribute Values', () => {
      // ARRANGE
      const item = { name: 'Francisco', age: 31, isCool: true };

      // ACT
      const { ExpressionAttributeValues } = updateExpressionBuilder(item);

      // ASSERT
      expect(ExpressionAttributeValues[':value_0']).toEqual(item.name);
      expect(ExpressionAttributeValues[':value_1']).toEqual(item.age);
      expect(ExpressionAttributeValues[':value_2']).toEqual(item.isCool);
    });
  });

  describe('with an array property', () => {
    it('should add "#field_[index]" for the array', () => {
      // ARRANGE
      const item = {
        name: 'Francisco',
        age: 31,
        isCool: true,
        pursuits: ['philosophy', 'physics', 'mining'],
      };

      // ACT
      const result = updateExpressionBuilder(item);

      // ASSERT
      expect(result.UpdateExpression).toContain('#field_3');
    });

    it('should add ":value_[index]" for the array', () => {
      // ARRANGE
      const item = {
        name: 'Francisco',
        age: 31,
        isCool: true,
        pursuits: ['philosophy', 'physics', 'mining'],
      };

      // ACT
      const result = updateExpressionBuilder(item);

      // ASSERT
      expect(result.UpdateExpression).toContain(':value_3');
    });

    it('should correctly build Attribute Names', () => {
      // ARRANGE
      const item = {
        name: 'Francisco',
        age: 31,
        isCool: true,
        pursuits: ['philosophy', 'physics', 'mining'],
      };

      // ACT
      const { ExpressionAttributeNames } = updateExpressionBuilder(item);

      // ASSERT
      expect(ExpressionAttributeNames['#field_3']).toEqual('pursuits');
    });

    it('should correctly build Attribute Values', () => {
      // ARRANGE
      const item = {
        name: 'Francisco',
        age: 31,
        isCool: true,
        pursuits: ['philosophy', 'physics', 'mining'],
      };

      // ACT
      const { ExpressionAttributeValues } = updateExpressionBuilder(item);

      // ASSERT
      expect(ExpressionAttributeValues[':value_3']).toEqual(item.pursuits);
    });
  });

  describe('with a map property', () => {
    it('should add "#field_[index]" for the map', () => {
      // ARRANGE
      const item = { name: 'Francisco', age: 31, isCool: true, company: { location: 'Argentina' } };

      // ACT
      const result = updateExpressionBuilder(item);

      // ASSERT
      expect(result.UpdateExpression).toContain('#field_3');
    });

    it('should add ":value_[index]" for the map', () => {
      // ARRANGE
      const item = { name: 'Francisco', age: 31, isCool: true, company: { location: 'Argentina' } };

      // ACT
      const result = updateExpressionBuilder(item);

      // ASSERT
      expect(result.UpdateExpression).toContain(':value_3');
    });

    it('should correctly build Attribute Names', () => {
      // ARRANGE
      const item = { name: 'Francisco', age: 31, isCool: true, company: { location: 'Argentina' } };

      // ACT
      const { ExpressionAttributeNames } = updateExpressionBuilder(item);

      // ASSERT
      expect(ExpressionAttributeNames['#field_3']).toEqual('company');
    });

    it('should correctly build Attribute Values', () => {
      // ARRANGE
      const item = { name: 'Francisco', age: 31, isCool: true, company: { location: 'Argentina' } };

      // ACT
      const { ExpressionAttributeValues } = updateExpressionBuilder(item);

      // ASSERT
      expect(ExpressionAttributeValues[':value_3']).toEqual(item.company);
    });
  });
});
