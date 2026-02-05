import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import globals from 'globals';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'scripts/',
      '*.config.js',
      '*.config.cjs',
      '.prettierrc.js',
    ],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // TanStack Query recommended rules
  ...tanstackQuery.configs['flat/recommended'],

  // Main configuration for TS/TSX files
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      // React rules
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-curly-brace-presence': 'warn',

      // React Hooks rules
      ...reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // JSX A11y rules
      ...jsxA11y.configs.recommended.rules,

      // TypeScript rules
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Import rules
      'import/no-unresolved': 0,
      'import/named': 0,
      'import/namespace': 0,
      'import/default': 0,
      'import/export': 0,

      // General rules
      'newline-before-return': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: 'Use @ imports instead of relative parent imports (../).',
            },
            {
              group: [
                './**/hooks/*',
                './**/components/*',
                './**/routes/*',
                './**/utils/*',
                './**/assets/*',
                './**/types/*',
              ],
              message: 'Use @ imports (e.g., @hooks/, @components/, etc.) instead of relative imports.',
            },
          ],
        },
      ],
    },
  }
);
