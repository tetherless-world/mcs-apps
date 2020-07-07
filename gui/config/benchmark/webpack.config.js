const configBase = require("@tetherless-world/twxplore-base/webpack.config.base");
const configDevServer = require("@tetherless-world/twxplore-base/webpack.config.devServer");
const merge = require("webpack-merge");
const path = require("path");

// variables
const distPath = path.join(__dirname, "..", "..", "dist", "benchmark");

// plugins
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function (env, argv) {
  return merge(configBase(env, argv), configDevServer(distPath), {
    context: path.join(__dirname, "..", "..", "src"),
    entry: {
      "benchmark-gui": "./benchmark/main.tsx",
    },
    output: {
      path: distPath,
      filename: "js/[name].js",
      publicPath: "",
    },
    plugins: [
      new CopyWebpackPlugin([{from: "shared/robots.txt", to: "robots.txt"}]),
      new HtmlWebpackPlugin({
        hash: true,
        template: "benchmark/index.html",
      }),
    ],
  });
};
