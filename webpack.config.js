const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "lib/services/core/index.js"),
  plugins: [new NodePolyfillPlugin()],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "iksdkweb.dist.js",
    library: "IK",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  mode: "production",
};
