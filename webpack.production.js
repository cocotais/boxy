const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const production = {
  mode: "production",
  module: {
    rules: [
      {
        test: /\.(jpg|png|gif|svg)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8192,
          },
        },
      },
    ],
  },
  plugins: [
    new CompressionPlugin({
      exclude: /.(txt|map)$/i,
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          toplevel: true,
          ie8: true,
          safari10: true,
        },
      }),
      new MiniCssExtractPlugin({}),
    ],
  },
  output: {
    filename: "[name].[contenthash:6].js",
  },
};

module.exports = merge.merge(common, production);
