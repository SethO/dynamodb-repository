module.exports = () => ({
  files: ['lib/**/*.js', 'jest-config/**/*.js', '!lib/**/*.test.js'],
  tests: ['lib/**/*.test.js'],
  env: {
    type: 'node',
    runner: 'node',
  },
  testFramework: 'jest',
  debug: true,
  setup(wallaby) {
    // eslint-disable-next-line global-require
    const jestConfig = require('./jest.config');
    wallaby.testFramework.configure(jestConfig);
  },
});
