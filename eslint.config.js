import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import perfectionist from 'eslint-plugin-perfectionist';
import unusedImports from 'eslint-plugin-unused-imports';

// ----------------------------------------------------------------------

/**
 * Flat config (ESLint 9+). Replaces the old .eslintrc.cjs, which was built on
 * eslint-config-airbnb — that config never shipped a maintained flat build, so
 * its rules are reproduced here only where they earned their place.
 */
export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'public/**', '*.config.js'] },

  // eslint-plugin-react 7.37 crashes on ESLint 10 while auto-detecting the
  // React version, so pin it globally.
  { settings: { react: { version: '19.3' } } },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  jsxA11y.flatConfigs.recommended,
  reactHooks.configs.flat['recommended-latest'],
  prettier,

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      perfectionist,
      'unused-imports': unusedImports,
    },
    rules: {
      // general
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
      'no-param-reassign': 'off',
      'prefer-destructuring': ['warn', { object: true, array: false }],

      // typescript
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/consistent-type-exports': 'warn',
      '@typescript-eslint/no-unused-vars': 'off', // handled by unused-imports

      // react
      'react/prop-types': 'off',
      'react/jsx-no-useless-fragment': ['warn', { allowExpressions: true }],
      'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],

      // unused imports
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // import ordering — same grouping the project already used
      'perfectionist/sort-exports': ['warn', { order: 'asc', type: 'line-length' }],
      'perfectionist/sort-named-imports': ['warn', { order: 'asc', type: 'line-length' }],
      'perfectionist/sort-named-exports': ['warn', { order: 'asc', type: 'line-length' }],
      'perfectionist/sort-imports': [
        'warn',
        {
          order: 'asc',
          type: 'line-length',
          newlinesBetween: 1, // v5: 'always' is now a line count
          groups: [
            'style',
            'type',
            ['builtin', 'external'],
            'custom-mui',
            'custom-routes',
            'custom-api',
            'custom-store',
            'custom-hooks',
            'custom-utils',
            'internal',
            'custom-components',
            'custom-sections',
            'custom-types',
            ['parent', 'sibling', 'index'],
            'unknown',
          ],
          // perfectionist v5: customGroups is an array, not a keyed object
          customGroups: [
            { groupName: 'custom-mui', elementNamePattern: '^@mui/.*' },
            { groupName: 'custom-api', elementNamePattern: '^src/api/.*' },
            { groupName: 'custom-store', elementNamePattern: '^src/store/.*' },
            { groupName: 'custom-hooks', elementNamePattern: '^src/hooks/.*' },
            { groupName: 'custom-utils', elementNamePattern: '^src/utils/.*' },
            { groupName: 'custom-types', elementNamePattern: '^src/types/.*' },
            { groupName: 'custom-routes', elementNamePattern: '^src/routes/.*' },
            { groupName: 'custom-sections', elementNamePattern: '^src/sections/.*' },
            { groupName: 'custom-components', elementNamePattern: '^src/components/.*' },
          ],
          internalPattern: ['^src/.*'],
        },
      ],
    },
  },

  // Vite config and other Node-side files
  {
    files: ['vite.config.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
  }
);
