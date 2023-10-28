export type ExpressionBuilderResult = {
  updateExpression: string;
  expressionAttributeNames: { [key: string]: string };
  expressionAttributeValues: { [key: string]: any };
};

export class UpdateExpressionsBuilder {
  private keyName: string;

  constructor(keyName: string) {
    this.keyName = keyName;
  }

  buildExpressionNames(item: any): { [key: string]: string } {
    const keylessItem = this.removeKey(item);
    const itemKeys = Object.keys(keylessItem);

    return itemKeys.reduce(
      (accumulator, k, index) => ({ ...accumulator, [`#prop_${index}`]: k }),
      {},
    );
  }

  buildExpressionValues(item: any): { [key: string]: any } {
    const keylessItem = this.removeKey(item);
    const itemKeys = Object.keys(keylessItem);

    return itemKeys.reduce(
      (accumulator, k, index) => ({ ...accumulator, [`:value_${index}`]: item[k] }),
      {},
    );
  }

  buildUpdateExpression(item: any) {
    const keylessItem = this.removeKey(item);
    const itemKeys = Object.keys(keylessItem);

    return `SET ${itemKeys.map((k, index) => `#prop_${index} = :value_${index}`).join(', ')}`;
  }

  private removeKey(item: any) {
    const itemCopy = { ...item };
    delete itemCopy[this.keyName];

    return itemCopy;
  }
}

// export const updateExpressionBuilder = (item: any): ExpressionBuilderResult => ({
//   updateExpression: internalUpdateBuilder(item),
//   expressionAttributeNames: internalNameBuilder(item),
//   expressionAttributeValues: internalValueBuilder(item),
// });

// const internalUpdateBuilder = (item: any): string => {
//   const itemKeys = Object.keys(item);

//   return `SET ${itemKeys.map((k, index) => `#prop_${index} = :value_${index}`).join(', ')}`;
// };

// const internalNameBuilder = (item: any): any => {
//   const itemKeys = Object.keys(item);

//   return itemKeys.reduce(
//     (accumulator, k, index) => ({ ...accumulator, [`#prop_${index}`]: k }),
//     {},
//   );
// };

// const internalValueBuilder = (item: any): any => {
//   const itemKeys = Object.keys(item);

//   return itemKeys.reduce(
//     (accumulator, k, index) => ({ ...accumulator, [`:value_${index}`]: item[k] }),
//     {},
//   );
// };
