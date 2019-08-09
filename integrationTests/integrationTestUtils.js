const AWS = require('aws-sdk');
const uuid = require('uuid/v1');

const TableName = 'HashKeyTestDB';
const DocClient = new AWS.DynamoDB.DocumentClient();

const createHashKeyItem = async () => {
  const item = {
    key: uuid(),
    field1: uuid(),
    map1: {
      field2: uuid(),
    },
  };

  return item;
};

const insertHashKeyItem = async (item) => {
  let itemToSave;
  if (!item) {
    itemToSave = await createHashKeyItem();
  } else {
    itemToSave = Object.assign({}, item);
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
