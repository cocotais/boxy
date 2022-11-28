const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
// const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    filename: "[name].[contenthash:6].js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: "html-loader",
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(jpg|png|gif|svg)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024,
          },
        },
        generator: {
          filename: "img/[name].[hash:6][ext]",
          publicPath: "./",
        },
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "src"),
    },
    port: 8000,
    compress: true,
    open: true,
    hot: true,
    devMiddleware: {
      index: true,
      serverSideRender: true,
      writeToDisk: true,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      favicon: path.resolve("src/icon/logo/favicon.ico"),
      template: "src/index.html",
      filename: "index.html",
      inject: "body",
    }),
    new MiniCssExtractPlugin({
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
  ],
  optimization: {
    runtimeChunk: "single",
    chunkIds: "size",
    splitChunks: {
      chunks: "all",
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        venders: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    // // 打包
    // minimize: true,
    // minimizer: [
    //   new TerserPlugin({
    //     parallel: true,
    //     terserOptions: {
    //       toplevel: true,
    //       ie8: true,
    //       safari10: true,
    //     },
    //   }),
    // ],
  },
};
