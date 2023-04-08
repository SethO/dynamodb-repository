module.exports = {
  extends: ['airbnb-base', 'prettier'],
  plugins: ['no-only-tests'],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'import/extensions': 0,
    'no-use-before-define': 'off',
    'no-only-tests/no-only-tests': 'error',
    'no-console': 2,
  },
};
