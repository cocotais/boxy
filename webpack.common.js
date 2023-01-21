const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js",
  resolve: {
    extensions: [".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: "html-loader",
      },
      {
        test: /\.jsx$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-react"],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.less$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"],
      },
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
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      favicon: path.resolve("src/icon/logo/favicon.ico"),
      template: "src/index.html",
      filename: "index.html",
      inject: "body",
    }),
    new MiniCssExtractPlugin({
      linkType: "text/css",
      filename: "[name].[contenthash:6].css",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./node_modules/blockly/media",
          to: "media",
        },
      ],
    }),
    new webpack.ProvidePlugin({
      React: "react",
    }),
  ],
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      chunks: "all",
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageInfo = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
            const packageName = packageInfo ? packageInfo[1] : "dynamic";
            return `npm.${packageName.replace("@", "")}`;
          },
        },
      },
    },
    minimize: false,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          toplevel: true,
          ie8: true,
          safari10: true,
        },
      }),
    ],
  },
  output: {
    filename: "[name].[contenthash:6].js",
    path: path.resolve(__dirname, "dist"),
  },
};
