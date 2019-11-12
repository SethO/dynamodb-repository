/* eslint-disable import/no-extraneous-dependencies */
const AWS = require('aws-sdk');
const faker = require('faker');

const TableName = 'HashKeyTestDB';
const DocClient = new AWS.DynamoDB.DocumentClient();

const createHashKeyItem = async () => {
  const createdDateString = faker.date.recent().toISOString();
  const item = {
    key: faker.random.uuid(),
    createdAt: createdDateString,
    updatedAt: createdDateString,
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
    itemToSave = await createHashKeyItem();
  } else {
    itemToSave = { ...item };
  }

  const putParams = {
    TableName,
    Item: itemToSave,
  };
  await DocClient.put(putParams).promise();

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
  const deleteParms = {
    TableName,
    Key: { key },
  };
  await DocClient.delete(deleteParms).promise();
};

const fetchHashKeyItem = async (key) => {
  const getParams = {
    TableName,
    Key: { key },
  };
  const { Item } = await DocClient.get(getParams).promise();

  return Item;
};

module.exports = {
  createHashKeyItem,
  insertHashKeyItem,
  removeHashKeyItem,
  fetchHashKeyItem,
  insertNumberOfHashKeyItems,
};