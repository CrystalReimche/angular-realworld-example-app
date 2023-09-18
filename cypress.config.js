const { defineConfig } = require('cypress')

module.exports = defineConfig({
  video: true,
  viewportHeight: 1080,
  viewportWidth: 1920,
  env: {
    // username: 'artem.bondar16@gmail.com',
    // password: 'CypressTest1',
    // apiUrl: 'https://api.realworld.io'
  },
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}'
  }
})