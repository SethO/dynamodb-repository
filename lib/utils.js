const createError = require('http-errors');

const createCursor = lastEvaluatedKey => (Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64'));

const parseCursor = (cursor) => {
  let result;
  try {
    result = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
  } catch (err) {
    throw createError.BadRequest('cursor is not valid');
  }
  return result;
};

module.exports = {
  createCursor,
  parseCursor,
};
