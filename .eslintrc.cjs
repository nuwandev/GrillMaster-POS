module.exports = {
  env: {
    browser: true,
    es2022: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['import'],
  rules: {
    // No unused variables
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // No var - use const/let
    'no-var': 'error',

    // Prefer const over let when possible
    'prefer-const': 'error',

    // No magic numbers (except common ones)
    'no-magic-numbers': [
      'warn',
      {
        ignore: [-1, 0, 1, 2, 100],
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true,
      },
    ],

    // Consistent return statements
    'consistent-return': 'error',

    // No implicit type coercion
    eqeqeq: ['error', 'always'],

    // Import ordering
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],

    // No console in production (warn only)
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // No nested ternary
    'no-nested-ternary': 'error',

    // Max function length
    'max-lines-per-function': [
      'warn',
      { max: 50, skipBlankLines: true, skipComments: true },
    ],

    // Prefer template literals
    'prefer-template': 'error',

    // No parameter reassignment
    'no-param-reassign': ['error', { props: false }],
  },
};
