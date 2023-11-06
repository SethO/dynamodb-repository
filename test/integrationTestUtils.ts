import { faker } from '@faker-js/faker';
import { ulid } from 'ulid';
import { DeleteCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import getDocumentClient from './documentClient';

const TableName = 'HashKeyTestDB';
const DocClient = getDocumentClient();

export const createTestKeyValueItem = () => {
  const createdDateString = faker.date.recent().toISOString();
  const item = {
    key: ulid(),
    createdAt: createdDateString,
    updatedAt: createdDateString,
    revision: faker.number.int({ min: 2 }),
    field1: faker.lorem.word(),
    map1: {
      field2: faker.lorem.word(),
    },
  };

  return item;
};

export const insertHashKeyItem = async (item?: any) => {
  let itemToSave;
  if (!item) {
    itemToSave = await createTestKeyValueItem();
  } else {
    itemToSave = { ...item };
  }

  const putParams = {
    TableName,
    Item: itemToSave,
  };
  await DocClient.send(new PutCommand(putParams));

  return itemToSave.key;
};

export const insertNumberOfHashKeyItems = async (number: number) => {
  const promises = [];
  for (let i = 0; i < number; i += 1) {
    promises.push(insertHashKeyItem());
  }

  return Promise.all(promises);
};

export const removeHashKeyItem = async (key: string) => {
  const deleteParams = {
    TableName,
    Key: { key },
  };
  await DocClient.send(new DeleteCommand(deleteParams));
};

export const fetchHashKeyItem = async (key: string) => {
  const getParams = {
    TableName,
    Key: { key },
  };
  const { Item } = await DocClient.send(new GetCommand(getParams));

  return Item;
};
