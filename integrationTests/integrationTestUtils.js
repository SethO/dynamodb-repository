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

const removeHashKeyItem = async (key) => {
  const deleteParms = {
    TableName,
    Key: { key },
  };
  await DocClient.delete(deleteParms).promise();
};

module.exports = {
  createHashKeyItem,
  insertHashKeyItem,
  removeHashKeyItem,
};
