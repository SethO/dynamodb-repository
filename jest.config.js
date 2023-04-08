module.exports = {
  setupFilesAfterEnv: ['jest-extended/all'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
};
