export default {
  name: "女孩踢球",
  slug: "girlsfootball",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.girlsfootball.app"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.girlsfootball.app"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    isProduction: process.env.APP_ENV === 'production',
    eas: {
      projectId: "your-project-id"
    }
  }
}; 