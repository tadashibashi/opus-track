// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const fs = require("fs");

// Get production or development mode
const isProduction = process.env.NODE_ENV == 'production';

// Main configuration
const config = {
  entry: {
    AudioPlayer: "./src/audio-player/index.ts"
  },
  output: {
    path: path.resolve(__dirname, '../public/scripts'),
  },
  devServer: {
    open: true,
    host: 'localhost',
    liveReload: true,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
  },
  devtool: 'inline-source-map',
  plugins: [],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
  },
};


// Set the entries for each file inside of src/pages
const pagesDir = path.resolve(__dirname, "src/pages");
const files = fs.readdirSync(pagesDir, {recursive: true});
files.forEach(file => {
  const extname = path.extname(file);
  if (extname === ".ts" || extname === ".tsx") {
    file = file.substring(0, file.lastIndexOf("."));
    config.entry["pages/" + file] = "./src/pages/" + file + ".ts";
  }
});


module.exports = () => {
  // isProduction from process.env.NODE_ENV sets the mode
  config.mode = isProduction ? "production" : "development";
  return config;
};
