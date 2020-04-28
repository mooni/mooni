const AddModuleExportsPlugin = require('add-module-exports-webpack-plugin');
const path = require('path');

const outputDir = path.join(__dirname, 'dist');

const moduleCommon = {
  rules: [
    {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: 'ts-loader'
    },
  ]
};
const resolveCommon = {
  extensions: [ '.tsx', '.ts', '.js' ],
};

module.exports = [
  {
    name: 'umd',
    mode: 'production',
    entry: './src/index.ts',
    output: {
      path: outputDir,
      filename: 'index.umd.js',
      libraryTarget: 'umd',
      globalObject: 'this',
      library: 'MooniWidget',
      libraryExport: 'default',
    },
    module: moduleCommon,
    resolve: resolveCommon,
  },
  {
    name: 'cjs',
    mode: 'production',
    entry: './src/index.ts',
    output: {
      path: outputDir,
      filename: 'index.cjs.js',
      libraryTarget: 'commonjs2',
    },
    module: moduleCommon,
    resolve: resolveCommon,
    plugins: [new AddModuleExportsPlugin()],
  },
  {
    name: 'es',
    mode: 'production',
    entry: './src/index.ts',
    output: {
      path: outputDir,
      filename: 'index.es.js',
    },
    module: moduleCommon,
    resolve: resolveCommon,
  },
];
