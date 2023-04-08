import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export type ConstructorArgs = {
  tableName: string;
  keyName: string;
  idOptions?: IdOptions;
  documentClient: DynamoDBDocumentClient;
}

export type IdOptions = {
  length?: number;
  prefix?: string;
}