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
  const kgBaseHref =
    process.env && process.env.KG_BASE_HREF ? process.env.KG_BASE_HREF : "/";
  console.info("using KG base href", kgBaseHref);
  return merge(configBase(env, argv), configDevServer(distPath), {
    context: path.join(__dirname, "..", "..", "src"),
    devServer: {
      publicPath: kgBaseHref,
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
        KG_BASE_HREF: `"${kgBaseHref}"`,
      }),
      new HtmlWebpackPlugin({
        hash: true,
        kgBaseHref,
        template: "kg/index.html",
      }),
    ],
  });
};
