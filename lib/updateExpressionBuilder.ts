export type ExpressionBuilderResult = {
  UpdateExpression: string;
  ExpressionAttributeNames: any;
  ExpressionAttributeValues: any;
};
export const updateExpressionBuilder = (item: any): ExpressionBuilderResult => ({
  UpdateExpression: internalUpdateBuilder(item),
  ExpressionAttributeNames: internalNameBuilder(item),
  ExpressionAttributeValues: internalValueBuilder(item),
});

const internalUpdateBuilder = (item: any): string => {
  const itemKeys = Object.keys(item);

  return `SET ${itemKeys.map((k, index) => `#field_${index} = :value_${index}`).join(', ')}`;
};

const internalNameBuilder = (item: any): any => {
  const itemKeys = Object.keys(item);

  return itemKeys.reduce(
    (accumulator, k, index) => ({ ...accumulator, [`#field_${index}`]: k }),
    {},
  );
};

const internalValueBuilder = (item: any): any => {
  const itemKeys = Object.keys(item);
  // itemKeys.reduce((accumulator, k, index) => ({ ...accumulator, [`:value${index}`]: item[k] }), {})
  return itemKeys.reduce(
    (accumulator, k, index) => ({ ...accumulator, [`:value_${index}`]: item[k] }),
    {},
  );
};
