#!/bin/bash

echo "📦 Bundling JS for iOS..."

npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output ios/main.jsbundle \
  --assets-dest ios

echo "✅ JS bundle 打包完成！"
