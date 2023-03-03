const { defineConfig } = require('cypress')

module.exports = defineConfig({
  defaultCommandTimeout: 30000,
  video: false,
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:3000',
    specPattern: '../{demos,tests}/**/*.spec.{js,ts}',
  },
})
