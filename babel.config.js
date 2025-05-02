module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    '@babel/plugin-transform-flow-strip-types',
    [
      'module-resolver',
      {
        root: ['./'],

        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        alias: {
          '@hooks': './src/hooks',
          '@utils': './src/utils',
          '@components': './src/components',
          '@screens': './src/screens',
          '@styles': './src/styles',
          '@constants': './src/constants',
          '@lib': './src/lib',
          '@assets': './assets',
          '@store': './src/store',
          '@services': './src/services',
          '@config': './src/config',
        },
      },
    ],
    ['@babel/plugin-transform-class-properties', { loose: false }],
    ['@babel/plugin-transform-private-methods', { loose: false }],
    ['@babel/plugin-transform-private-property-in-object', { loose: false }],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
};
