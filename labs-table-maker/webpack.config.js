const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

let config = {
  context: __dirname + '/src', // `__dirname` is root of project and `src` is source
  entry: {
    app: './app.js',
  },
  output: {
    path: __dirname + '/dist', // `dist` is the destination
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      { test: /\.css$/, use: [ 'style-loader', 'css-loader' ] },
      { test: /\.html$/, use: [ 'string-loader' ] }
    ]
  },
  resolve: {
    alias: {
      request: "browser-request",
      fs: "memory-fs",
      "decimal.js": path.resolve(__dirname, 'src/decimal-fix.js')
    },
  },
  plugins:[new HtmlWebpackPlugin({ title: 'Table Maker' })]
};

module.exports = config;
