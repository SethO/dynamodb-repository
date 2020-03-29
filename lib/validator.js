const Joi = require('@hapi/joi');

const keyValueRepoConstructorSchema = Joi.object().keys({
  tableName: Joi.string().required(),
  hashKeyName: Joi.string().required(),
  idOptions: Joi.object().keys({
    length: Joi.number(),
    prefix: Joi.string().token(),
  }),
});

const createMessage = (error) => (
  error.details
    .map((detail) => detail.message)
    .join(', ')
);

const keyValueRepoConstructor = (constructorArgs) => {
  const { error } = keyValueRepoConstructorSchema.validate(constructorArgs);
  if (error) {
    const errorMessage = createMessage(error);
    throw Error(errorMessage);
  }
};

module.exports = {
  keyValueRepoConstructor,
};
