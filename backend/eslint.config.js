// eslint.config.js

import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,

  {
    files: ['**/*.js'],

    ignores: ['node_modules/**', 'logs/**', 'coverage/**', 'dist/**', 'build/**', '*.min.js'],

    languageOptions: {
      ecmaVersion: 'latest',

      sourceType: 'module',

      globals: {
        ...globals.node,
      },
    },

    plugins: {
      prettier,
    },

    rules: {
      /*
       |--------------------------------------------------------------------------
       | Prettier
       |--------------------------------------------------------------------------
       */

      'prettier/prettier': 'error',

      /*
       |--------------------------------------------------------------------------
       | Best Practices
       |--------------------------------------------------------------------------
       */

      eqeqeq: ['error', 'always'],

      curly: ['error', 'all'],

      'no-var': 'error',

      'prefer-const': 'error',

      'no-duplicate-imports': 'error',

      /*
       |--------------------------------------------------------------------------
       | Security / Production
       |--------------------------------------------------------------------------
       */

      'no-console':
        process.env.NODE_ENV === 'production' ? ['warn', { allow: ['warn', 'error'] }] : 'off',

      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

      /*
       |--------------------------------------------------------------------------
       | Clean Code
       |--------------------------------------------------------------------------
       */

      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];
