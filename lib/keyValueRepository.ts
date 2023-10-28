import { BadRequest, NotFound, Conflict } from 'http-errors';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  PutCommandInput,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
  UpdateCommand,
  UpdateCommandInput,
  UpdateCommandOutput,
} from '@aws-sdk/lib-dynamodb';

import { ConstructorArgs, IdOptions } from './types';
import keyValueRepoConstructor from './validator';
import { createCursor, parseCursor, createId, createDynamoDbKey } from './utils';
import { UpdateExpressionsBuilder } from './updateExpressionBuilder';

class KeyValueRepository {
  private tableName: string;

  private keyName: string;

  private idOptions?: IdOptions;

  private docClient: DynamoDBDocumentClient;

  private updateExpressionsBuilder: UpdateExpressionsBuilder;

  /**
   * Create a HashKey Repository
   * @param {Object} param - The constructor parameter
   * @param {string} param.tableName - The name of your DynamoDB table
   * @param {string} param.keyName - The name of your Hash/Partition Key property
   * @param {Object} param.documentClient - Injectable DynamoDBDocumentClient (v3) from @aws-sdk/lib-dynamodb
   * @param {Object} [param.idOptions] - The idOptions parameter
   * @param {string} [param.idOptions.prefix=] - The prefix of your id
   */
  constructor(input: ConstructorArgs) {
    keyValueRepoConstructor(input);
    const { tableName, keyName, idOptions, documentClient } = input;
    this.tableName = tableName;
    this.keyName = keyName;
    this.idOptions = idOptions;
    this.docClient = documentClient;
    this.updateExpressionsBuilder = new UpdateExpressionsBuilder(keyName);
  }

  async get(hashKey: string) {
    const key = createDynamoDbKey({ keyName: this.keyName, keyValue: hashKey });
    const getParams = {
      TableName: this.tableName,
      Key: key,
    };
    const { Item } = await this.docClient.send(new GetCommand(getParams));
    if (!Item) {
      const message = `No ${this.keyName} found for ${hashKey}`;
      throw NotFound(message);
    }

    return Item;
  }

  async getMany(input: { limit?: number; cursor?: string } = {}) {
    const { limit = 100, cursor } = input;
    const scanParams: ScanCommandInput = {
      TableName: this.tableName,
      Limit: limit,
    };
    if (cursor) {
      scanParams.ExclusiveStartKey = parseCursor(cursor);
    }
    let result: ScanCommandOutput;
    try {
      result = await this.docClient.send(new ScanCommand(scanParams));
    } catch (err: any) {
      if (err.code === 'ValidationException') {
        throw new BadRequest('cursor is not valid');
      }
      throw err;
    }
    const returnCursor = result.LastEvaluatedKey
      ? createCursor(result.LastEvaluatedKey)
      : undefined;

    return {
      items: result.Items || [],
      cursor: returnCursor,
    };
  }

  async remove(hashKey: string) {
    const key = createDynamoDbKey({ keyName: this.keyName, keyValue: hashKey });
    const deleteParams = {
      TableName: this.tableName,
      Key: key,
    };
    await this.docClient.send(new DeleteCommand(deleteParams));
  }

  async create(item: any) {
    const itemToSave = { ...item };
    itemToSave[this.keyName] = await createId(this.idOptions);
    const isoString = new Date().toISOString();
    itemToSave.createdAt = isoString;
    itemToSave.updatedAt = isoString;
    itemToSave.revision = 1;

    const putParams = {
      TableName: this.tableName,
      Item: itemToSave,
    };
    await this.docClient.send(new PutCommand(putParams));

    return itemToSave;
  }

  async update(item: any) {
    validateHashKeyPropertyExists({ item, keyName: this.keyName });
    const { revision: previousRevision } = item;
    const itemToSave = setRepositoryModifiedProperties(item);
    const putParams: PutCommandInput = {
      TableName: this.tableName,
      Item: itemToSave,
      ConditionExpression: 'attribute_exists(#key) AND #revision = :prevRev',
      ExpressionAttributeNames: {
        '#key': this.keyName,
        '#revision': 'revision',
      },
      ExpressionAttributeValues: {
        ':prevRev': previousRevision,
      },
      ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
    };
    try {
      await this.docClient.send(new PutCommand(putParams));
    } catch (err: any) {
      if (err.name === 'ConditionalCheckFailedException') {
        const { Item } = err;
        if (isNotFoundConflict(Item)) {
          throw NotFound();
        }
        if (
          isRevisionConflict({
            expectedRevision: previousRevision,
            actualRevision: Item?.revision?.N,
          })
        ) {
          throw Conflict(
            `Conflict: Item in DB has revision [${Item?.revision?.N}]. You are using revision [${previousRevision}]`,
          );
        }
      }
      throw err;
    }

    return itemToSave;
  }

  async updatePartial(item: any): Promise<Record<string, any>> {
    validateHashKeyPropertyExists({ item, keyName: this.keyName });
    const updateInput = this.buildUpdateCommandInput(item);
    let result: UpdateCommandOutput;
    try {
      result = await this.docClient.send(new UpdateCommand(updateInput));
    } catch (err: any) {
      if (err.name === 'ConditionalCheckFailedException') {
        const { Item } = err;
        if (isNotFoundConflict(Item)) {
          throw NotFound();
        }
        if (
          isRevisionConflict({
            expectedRevision: item.revision,
            actualRevision: Item?.revision?.N,
          })
        ) {
          throw Conflict(
            `Conflict: Item in DB has revision [${Item?.revision?.N}]. You are using revision [${item.revision}]`,
          );
        }
      }
      throw err;
    }
    return result.Attributes || {};
  }

  private buildUpdateCommandInput(item: any): UpdateCommandInput {
    const { revision: previousRevision } = item;
    const itemToSave = setRepositoryModifiedPropertiesForPartialUpdate(item);
    const key = createDynamoDbKey({ keyName: this.keyName, keyValue: itemToSave[this.keyName] });
    const updateInput: UpdateCommandInput = {
      TableName: this.tableName,
      Key: key,
      ConditionExpression: 'attribute_exists(#key) AND #revision = :prevRev',
      UpdateExpression: this.updateExpressionsBuilder.buildUpdateExpression(itemToSave),
      ExpressionAttributeNames: {
        '#key': this.keyName,
        '#revision': 'revision',
        ...this.updateExpressionsBuilder.buildExpressionNames(itemToSave),
      },
      ExpressionAttributeValues: {
        ':prevRev': previousRevision,
        ...this.updateExpressionsBuilder.buildExpressionValues(itemToSave),
      },
      ReturnValues: 'ALL_NEW',
      ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
    };

    return updateInput;
  }
}

const isNotFoundConflict = (itemFromError?: any) => !itemFromError;

const isRevisionConflict = (input: { expectedRevision: number; actualRevision: number }) => {
  const { expectedRevision, actualRevision } = input;

  return expectedRevision !== actualRevision;
};

const validateHashKeyPropertyExists = (input: { item: any; keyName: string }) => {
  const { item, keyName } = input;
  if (!item[keyName]) {
    throw new BadRequest(`Bad Request: Item has no key named "${keyName}"`);
  }
};

const setRepositoryModifiedProperties = (item: any) => {
  const returnItem = { ...item };
  returnItem.updatedAt = new Date().toISOString();
  returnItem.revision = item.revision + 1;

  return returnItem;
};

const setRepositoryModifiedPropertiesForPartialUpdate = (item: any) => {
  const returnItem = { ...item };
  delete returnItem.createdAt;
  returnItem.updatedAt = new Date().toISOString();
  returnItem.revision = item.revision + 1;

  return returnItem;
};

export default KeyValueRepository;
