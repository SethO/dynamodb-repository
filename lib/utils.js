const createError = require('http-errors');
const generate = require('nanoid/generate');

const IdDictionary = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const createCursor = (lastEvaluatedKey) => (Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64'));

const parseCursor = (cursor) => {
  let result;
  try {
    result = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
  } catch (err) {
    throw createError.BadRequest('cursor is not valid');
  }
  return result;
};

const createId = ({ length = 22, prefix = '' } = {}) => {
  const theRandomBits = generate(IdDictionary, length);
  
  return `${prefix}${theRandomBits}`;
};

module.exports = {
  createCursor,
  parseCursor,
  createId,
};
