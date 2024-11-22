import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import prettier from 'eslint-plugin-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'warn',
      semi: ['warn', 'always'],
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
    },
  },
];
