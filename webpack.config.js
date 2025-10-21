//@ts-check

"use strict";

const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: "node",
  mode: "none",
  node: {
    __dirname: false, // leave the __dirname-behaviour intact
  },

  entry: "./src/extension.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
    webassemblyModuleFilename: "[hash].wasm",
  },
  externals: {
    vscode: "commonjs vscode",
    positron: "commonjs positron",
  },
  resolve: {
    alias: {
      positron: path.resolve(__dirname, "positron-dts/positron.d.ts"),
    },
    extensions: [".ts", ".js", ".wasm"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
      {
        test: /\.wasm$/,
        type: "asset/resource",
        generator: {
          filename: "[name].[hash][ext]",
        },
      },
    ],
  },
  experiments: {
    asyncWebAssembly: true,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "resources/testing",
          to: "resources/testing",
        },
        {
          from: "node_modules/web-tree-sitter/tree-sitter.wasm",
          to: "tree-sitter.wasm",
        },
      ],
    }),
  ],
  devtool: "nosources-source-map",
  infrastructureLogging: {
    level: "log",
  },
};
module.exports = [extensionConfig];
