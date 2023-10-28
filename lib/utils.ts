import { ulid } from 'ulid';
import { BadRequest } from 'http-errors';

export const createCursor = (lastEvaluatedKey: Record<string, any> | string) =>
  Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');

export const parseCursor = (cursor: string) => {
  let result;
  try {
    result = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
  } catch (err) {
    throw new BadRequest('Bad Request: cursor is not valid');
  }
  return result;
};

export const createId = async ({ prefix = '' } = {}) => `${prefix}${ulid()}`;

export const createDynamoDbKey = (input: { keyName: string; keyValue: any }) => {
  const { keyName, keyValue } = input;

  return { [keyName]: keyValue };
};
