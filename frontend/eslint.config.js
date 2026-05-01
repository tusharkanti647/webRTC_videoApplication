// eslint.config.js

import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,

  {
    files: ['**/*.{js,jsx}'],

    ignores: ['node_modules/**', 'build/**', 'dist/**', 'coverage/**'],

    languageOptions: {
      ecmaVersion: 'latest',

      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },

      globals: {
        globals: {
          ...globals.browser,
          ...globals.node,
        },
      },
    },

    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      prettier,
    },

    settings: {
      react: {
        version: 'detect',
      },
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
       | JavaScript Best Practices
       |--------------------------------------------------------------------------
       */

      eqeqeq: ['error', 'always'],

      curly: ['error', 'all'],

      'no-var': 'error',

      'prefer-const': 'error',

      'no-console':
        process.env.NODE_ENV === 'production' ? ['warn', { allow: ['warn', 'error'] }] : 'off',

      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

      'no-duplicate-imports': 'error',

      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      /*
       |--------------------------------------------------------------------------
       | React
       |--------------------------------------------------------------------------
       */

      'react/react-in-jsx-scope': 'off',

      'react/prop-types': 'off',

      'react/jsx-uses-react': 'off',

      'react/jsx-uses-vars': 'error',

      'react/self-closing-comp': 'error',

      'react/jsx-no-target-blank': 'error',

      /*
       |--------------------------------------------------------------------------
       | React Hooks
       |--------------------------------------------------------------------------
       */

      'react-hooks/rules-of-hooks': 'error',

      'react-hooks/exhaustive-deps': 'warn',

      /*
       |--------------------------------------------------------------------------
       | Accessibility
       |--------------------------------------------------------------------------
       */

      'jsx-a11y/alt-text': 'warn',

      'jsx-a11y/anchor-is-valid': 'warn',
    },
  },
];
