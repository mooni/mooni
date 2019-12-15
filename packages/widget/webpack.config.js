const path = require('path');

const moduleCommon = {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      include: path.resolve(__dirname, 'src'),
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['add-module-exports', ['@babel/plugin-transform-runtime']],
        }
      }
    },
  ]
};

module.exports = [
  {
    name: 'umd',
    mode: 'production',
    entry: './src/index.js',
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'index.umd.js',
      libraryTarget: 'umd',
      globalObject: 'this',
      library: 'MooniWidget',
      libraryExport: 'default',
    },
    module: moduleCommon,
  },
  {
    name: 'cjs',
    mode: 'production',
    entry: './src/index.js',
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'index.cjs.js',
      libraryTarget: 'commonjs2',
    },
    module: moduleCommon,
  },
  {
    name: 'es',
    mode: 'production',
    entry: './src/index.js',
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'index.es.js',
    },
    module: moduleCommon,
  },
];
