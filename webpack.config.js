const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: [
    path.resolve(__dirname, "lib/services/core/index.js"),
    path.resolve(__dirname, "lib/services/core/exports/styles.scss"),
  ],
  plugins: [new MiniCssExtractPlugin({ filename: "styles.css" }), new NodePolyfillPlugin()],
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
      {
        test: /\.(scss)$/,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  mode: "production",
};
