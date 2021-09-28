const path = require('path');

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.ts',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    alias: {
      
      [path.join(__dirname, '/node_modules/@abandonware/noble/lib/mac/bindings.js')]: path.join(
        __dirname,
        'bindings/noble-bindings.js'
      ),
    },
  },
};
