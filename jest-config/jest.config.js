const path = require('path');

module.exports = {
  rootDir: path.join(__dirname, '..'),
  setupFilesAfterEnv: ['<rootDir>/jest-config/jestSetup.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
};
