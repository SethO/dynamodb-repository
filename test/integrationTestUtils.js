/* eslint-disable import/no-extraneous-dependencies */
const { faker } = require('@faker-js/faker');
const { ulid } = require('ulid');
const { DeleteCommand, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const getDynamoDbClient = require('./documentClient');

const TableName = 'HashKeyTestDB';
const DocClient = getDynamoDbClient();

const createKeyValueItem = async () => {
  const createdDateString = faker.date.recent().toISOString();
  const item = {
    key: ulid(),
    createdAt: createdDateString,
    updatedAt: createdDateString,
    revision: faker.datatype.number({ min: 1, max: 50 }),
    field1: faker.lorem.word(),
    map1: {
      field2: faker.lorem.word(),
    },
  };

  return item;
};

const insertHashKeyItem = async (item) => {
  let itemToSave;
  if (!item) {
    itemToSave = await createKeyValueItem();
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

const insertNumberOfHashKeyItems = async (number) => {
  const promises = [];
  for (let i = 0; i < number; i += 1) {
    promises.push(insertHashKeyItem());
  }

  return Promise.all(promises);
};

const removeHashKeyItem = async (key) => {
  const deleteParams = {
    TableName,
    Key: { key },
  };
  await DocClient.send(new DeleteCommand(deleteParams));
};

const fetchHashKeyItem = async (key) => {
  const getParams = {
    TableName,
    Key: { key },
  };
  const { Item } = await DocClient.send(new GetCommand(getParams));

  return Item;
};

module.exports = {
  createKeyValueItem,
  insertHashKeyItem,
  removeHashKeyItem,
  fetchHashKeyItem,
  insertNumberOfHashKeyItems,
};
