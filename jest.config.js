/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  verbose: false,
  testEnvironment: "jsdom",
  collectCoverageFrom: ["./lib/**/*.js"],
  coverageReporters: ["text-summary", "html"],
};

module.exports = config;
