module.exports = {
  plugins: ['html', 'cypress', '@typescript-eslint'],

  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },

  env: {
    es6: true,
    node: true,
    'cypress/globals': true,
  },

  globals: {
    document: false,
    window: false,
  },

  extends: [
    'plugin:vue/strongly-recommended',
    'airbnb-base',
  ],

  rules: {
    semi: ['error', 'never'],
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'import/no-dynamic-require': 'off',
    'arrow-parens': ['error', 'as-needed'],
    'padded-blocks': 'off',
    'class-methods-use-this': 'off',
    'global-require': 'off',
    'func-names': ['error', 'never'],
    'arrow-body-style': 'off',
    'max-len': 'off',
    'vue/this-in-template': ['error', 'never'],
    'vue/max-attributes-per-line': ['error', {
      singleline: 3,
      multiline: {
        max: 1,
        allowFirstLine: false,
      },
    }],
    'no-param-reassign': 'off',
    'import/prefer-default-export': 'off',
    'consistent-return': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
  },
}
