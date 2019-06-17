var path = require('path');
var WebpackNotifierPlugin = require('webpack-notifier');

const electron = {
  mode: "production",
  entry: {
    "app": './src/jsx/component/app/index.jsx',
    "preferences": './src/jsx/component/preferences/index.jsx',
    "main": './src/main_process/main.js'
  },
  output: {
    path: path.resolve('./dist/js'),
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  node: {
    __dirname: false,
    __filename: false
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss'],
    modules: [
      "node_modules",
      path.resolve('./src/')
    ]
  },
  externals: [
    '2ch-parser',
    'electron',
    'electron-json-storage',
    'electron-store',
    'electron-react-devtools',
    'ipc',
    'fs',
    'http',
    'superagent',
    'encoding-japanese'
  ],
  plugins: [
    new WebpackNotifierPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['transform-react-jsx', 'transform-class-properties']
          }
        }
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'resolve-url-loader' },
          { loader: 'sass-loader' }
        ]
      },
      {
        test: /\.png$/,
        use: {
          loader: 'url-loader?mimetype=image/png'
        }
      }
    ]
  },
  performance: { hints: false }
};

const jimaku = {
  mode: "production",
  entry: {
    "jimaku_browser": './src/js/jimaku_browser.js',
  },
  output: {
    path: path.resolve('./dist/js'),
    filename: '[name].js',
    libraryTarget: 'umd'
  },
  node: {
    __dirname: false,
    __filename: false
  },
  resolve: {
    extensions: ['.js'],
    modules: [
      "node_modules",
      path.resolve('./src/')
    ]
  },
  externals: [
    'http',
    'fs',
  ],
  plugins: [
    new WebpackNotifierPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['transform-class-properties']
          }
        }
      }
    ]
  },
  performance: { hints: false }
};

module.exports = [electron, jimaku]