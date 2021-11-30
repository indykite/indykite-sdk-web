/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  verbose: false,
  testEnvironment: "jsdom",
  collectCoverageFrom: ["./lib/**/*.js"],
  coverageReporters: ["text", "text-summary", "json-summary"],
  moduleDirectories: ["src", "node_modules"],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};

module.exports = config;
