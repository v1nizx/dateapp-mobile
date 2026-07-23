const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add .cjs to source extensions to support Firebase internals
defaultConfig.resolver.sourceExts.push('cjs');

// Disable unstable package exports which conflicts with Firebase Auth v10 in React Native
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
