module.exports = {
  env: {
    node: true,
    jest: true,
  },
  extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['no-only-tests'],
  root: true,
  rules: {
    'import/extensions': 0,
    'no-only-tests/no-only-tests': 'error',
    'no-use-before-define': 'off',
    'no-console': 2,
    '@typescript-eslint/no-use-before-define': 0,
  },
  settings: {
    'import/resolver': 'node',
  },
};
