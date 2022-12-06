const merge = require("webpack-merge");
const common = require("./webpack.common.js");

const development = {
  mode: "development",
  devtool: "source-map",
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
};

module.exports = merge.merge(common, development);
