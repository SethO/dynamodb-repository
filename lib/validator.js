const Joi = require('joi');

const hashKeyRepoConstructorSchema = Joi.object().keys({
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

const hashKeyRepoConstructor = (constructorArgs) => {
  const { error } = Joi.validate(constructorArgs, hashKeyRepoConstructorSchema);
  if (error) {
    const errorMessage = createMessage(error);
    throw Error(errorMessage);
  }
};

module.exports = {
  hashKeyRepoConstructor,
};
