const production = require("./webpack.production");
const merge = require("webpack-merge");
const path = require("path");

const simulation = {
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
  performance: {
    maxEntrypointSize: 102400000,
    maxAssetSize: 102400000,
  },
};

module.exports = merge.merge(production, simulation);
