const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite v16 web support: allow Metro to bundle .wasm files as assets
config.resolver.assetExts.push('wasm');

module.exports = config;
