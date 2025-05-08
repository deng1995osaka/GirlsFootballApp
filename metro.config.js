const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@lib': path.resolve(__dirname, 'src/lib'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@screens': path.resolve(__dirname, 'src/screens'),
  '@styles': path.resolve(__dirname, 'src/styles'),
  '@constants': path.resolve(__dirname, 'src/constants'),
  '@assets': path.resolve(__dirname, 'assets'),
  '@store': path.resolve(__dirname, 'src/store'),
  '@services': path.resolve(__dirname, 'src/services'),
  '@config': path.resolve(__dirname, 'src/config'),
};

module.exports = config;
