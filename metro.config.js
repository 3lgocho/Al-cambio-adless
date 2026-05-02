const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Le decimos a Metro que incluya los archivos .wasm como assets
config.resolver.assetExts.push('wasm');

module.exports = config;