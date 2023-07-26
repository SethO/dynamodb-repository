import Joi from 'joi';
import { BadRequest } from 'http-errors';

import { ConstructorArgs } from './types';

const keyValueRepoConstructorSchema = Joi.object().keys({
  tableName: Joi.string().required(),
  keyName: Joi.string().required(),
  idOptions: Joi.object().keys({
    prefix: Joi.string(),
  }),
  documentClient: Joi.object().required(),
});

const createMessage = (error: Joi.ValidationError) =>
  error.details.map((detail) => detail.message).join(', ');

const keyValueRepoConstructor = (constructorArgs: ConstructorArgs) => {
  const { error } = keyValueRepoConstructorSchema.validate(constructorArgs);
  if (error) {
    const errorMessage = createMessage(error);
    throw new BadRequest(`Bad Request: ${errorMessage}`);
  }
};

export default keyValueRepoConstructor;
