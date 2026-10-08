const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, "../easybuy-api-client")];

module.exports = config;
