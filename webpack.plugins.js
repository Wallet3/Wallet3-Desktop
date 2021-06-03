const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  //https://github.com/typeorm/typeorm/blob/master/docs/faq.md#how-to-use-webpack-for-the-backend
  new FilterWarningsPlugin({
    exclude: [
      /mongodb/,
      /mssql/,
      /mysql/,
      /mysql2/,
      /oracledb/,
      /pg/,
      /pg-native/,
      /pg-query-stream/,
      /react-native-sqlite-storage/,
      /redis/,
      /sql.js/,
      /typeorm-aurora-data-api-driver/,
    ],
  }),
];
