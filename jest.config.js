/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  verbose: false,
  testEnvironment: "jsdom",
  collectCoverageFrom: ["./lib/**/*.js"],
  coverageReporters: ["text", "text-summary", "json-summary"],
  moduleDirectories: ["src", "node_modules"],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  transformIgnorePatterns: [
    "node_modules/(?!" +
      ["query-string", "decode-uri-component", "split-on-first", "filter-obj"].join("|") +
      ")",
  ],
};

module.exports = config;
