const Joi = require('@hapi/joi');
const { BadRequest } = require('http-errors');

const keyValueRepoConstructorSchema = Joi.object().keys({
  tableName: Joi.string().required(),
  keyName: Joi.string().required(),
  idOptions: Joi.object().keys({
    length: Joi.number(),
    prefix: Joi.string().token(),
  }),
  documentClient: Joi.object().required(),
});

const createMessage = (error) => error.details.map((detail) => detail.message).join(', ');

const keyValueRepoConstructor = (constructorArgs) => {
  const { error } = keyValueRepoConstructorSchema.validate(constructorArgs);
  if (error) {
    const errorMessage = createMessage(error);
    throw new BadRequest(`Bad Request: ${errorMessage}`);
  }
};

module.exports = {
  keyValueRepoConstructor,
};
