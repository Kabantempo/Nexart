const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude web folder and other non-mobile files
config.resolver = {
  ...config.resolver,
  blockList: [
    /web\/.*/,
    /web\/node_modules\/.*/,
    /.git\/.*/,
  ],
};

// Only watch src and app directories
config.watchFolders = [
  path.join(__dirname, 'src'),
  path.join(__dirname, 'app'),
  path.join(__dirname, 'node_modules'),
];

module.exports = config;
