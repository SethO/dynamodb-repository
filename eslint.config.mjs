import tseslint from 'typescript-eslint';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['node_modules/**', 'coverage/**', '.build/**'],
  },
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ['**/*.ts', '**/*.js'],
    plugins: {
      'no-only-tests': noOnlyTests,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-only-tests/no-only-tests': 'error',
      'no-use-before-define': 'off',
      'no-console': 2,
      '@typescript-eslint/no-use-before-define': 0,
      '@typescript-eslint/no-explicit-any': 0,
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
);
