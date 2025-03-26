const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.extraNodeModules = {
  stream: require.resolve('stream-browserify'),
  crypto: require.resolve('crypto-browserify'),
  http: require.resolve('stream-http'),
  https: require.resolve('https-browserify'),
  os: require.resolve('os-browserify/browser'),
  path: require.resolve('path-browserify'),
  querystring: require.resolve('querystring-es3'),
  url: require.resolve('url-parse'),
  fs: require.resolve('react-native-fs'),
  assert: require.resolve('assert'),
  timers: require.resolve('timers-browserify'),
  net: false,
  tls: false,
  zlib: require.resolve('browserify-zlib'),
};

module.exports = defaultConfig; 