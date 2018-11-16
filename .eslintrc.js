module.exports = {
  plugins: ['html'],

  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },

  env: {
    es6: true,
    node: true,
  },

  globals: {
    document: false,
    navigator: false,
    window: false,
    collect: false,
    cy: false,
    test: false,
    expect: false,
    it: false,
    describe: false,
    FileReader: false,
  },

  extends: [
    'airbnb-base',
  ],

  rules: {
    // required semicolons
    'semi': ['error', 'never'],

    // indent
    'no-tabs': 'off',
    'indent': 'off',

    // disable some import stuff
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'import/no-dynamic-require': 'off',

    // disable for '__svg__'
    'no-underscore-dangle': 'off',

    'arrow-parens': ['error', 'as-needed'],

    'padded-blocks': 'off',

    'class-methods-use-this': 'off',

    'global-require': 'off',
  }
}
