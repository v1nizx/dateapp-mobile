// app.config.js — configuração para Expo SDK 54 & EAS Update

/** @type {import('@expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: 'Date App',
    slug: 'date-app-mobile',
    scheme: 'dateapp',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FFE4EE',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.dateapp.mobile',
    },
    android: {
      package: 'com.dateapp.mobile',
      versionCode: 2,
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
      ],
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFE4EE',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/bcf1a441-e6e9-4a60-8aa6-9c4e655269aa',
    },
    extra: {
      eas: {
        projectId: 'bcf1a441-e6e9-4a60-8aa6-9c4e655269aa',
      },
    },
    plugins: [
      'expo-font',
      'expo-web-browser',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'O DateApp precisa da sua localização para encontrar lugares românticos próximos a você.',
        },
      ],
    ],
  },
};
