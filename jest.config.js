/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  verbose: false,
  testEnvironment: "jsdom",
  collectCoverageFrom: ["./lib/**/*.js"],
  coverageReporters: ["text", "text-summary", "json-summary"],
  moduleDirectories: ["src", "node_modules"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = config;
