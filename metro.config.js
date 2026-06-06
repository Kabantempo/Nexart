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

// Only watch src directory (no Expo Router app/ folder in this project)
config.watchFolders = [
  path.join(__dirname, 'src'),
  path.join(__dirname, 'node_modules'),
];

module.exports = config;
