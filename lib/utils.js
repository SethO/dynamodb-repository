const createError = require('http-errors');
const { ulid } = require('ulid');

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

const createId = async ({ prefix = '' } = {}) => (`${prefix}${ulid()}`);

module.exports = {
  createCursor,
  parseCursor,
  createId,
};
