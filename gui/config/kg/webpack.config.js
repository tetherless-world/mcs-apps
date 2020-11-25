const configBase = require("@tetherless-world/twxplore-base/webpack.config.base");
const configDevServer = require("@tetherless-world/twxplore-base/webpack.config.devServer");
const merge = require("webpack-merge");
const path = require("path");
const webpack = require("webpack");

// variables
const distPath = path.join(__dirname, "..", "..", "dist", "kg");

// plugins
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function (env, argv) {
  const baseHref =
    process.env && process.env.BASE_HREF ? process.env.BASE_HREF : "/";
  console.info("using base href", baseHref);

  const devServerProxy = {};
  devServerProxy[baseHref + "api"] = {
    target: {
      host: "localhost",
      protocol: "http:",
      port: 9000,
    },
    secure: false,
  };

  return merge(configBase(env, argv), configDevServer(distPath), {
    context: path.join(__dirname, "..", "..", "src"),
    devServer: {
      publicPath: baseHref,
      proxy: devServerProxy,
    },
    // devtool: "source-map",
    entry: {
      "kg-gui": "./kg/main.tsx",
    },
    output: {
      path: distPath,
      filename: "js/[name].js",
      publicPath: "",
    },
    plugins: [
      new CopyWebpackPlugin([{from: "shared/robots.txt", to: "robots.txt"}]),
      new webpack.DefinePlugin({
        BASE_HREF: `"${baseHref}"`,
      }),
      new HtmlWebpackPlugin({
        baseHref,
        hash: true,
        template: "kg/index.html",
      }),
    ],
  });
};
