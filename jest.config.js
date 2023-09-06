module.exports = {
  setupFilesAfterEnv: ['jest-extended/all'],
  testEnvironment: 'node',
  testTimeout: 30000,
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
};
