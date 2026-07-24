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
      // googleServicesFile: './GoogleService-Info.plist', // habilitar quando tiver iOS
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
      // Necessário para Google Sign-In nativo no Android
      googleServicesFile: './google-services.json',
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
      [
        'react-native-google-mobile-ads',
        {
          // IDs reais do AdMob (console.admob.google.com)
          // Para testes, use os IDs de teste do Google:
          //   Android: ca-app-pub-3940256099942544~3347511713
          //   iOS:     ca-app-pub-3940256099942544~1458002511
          androidAppId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID || 'ca-app-pub-3940256099942544~3347511713',
          iosAppId: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || 'ca-app-pub-3940256099942544~1458002511',
          // Delay de inicialização para SKAdNetwork (iOS)
          delay_app_measurement_init: false,
          // Conteúdo adulto: false para app familiar
          user_tracking_usage_description: 'Este identificador será usado para exibir anúncios personalizados.',
          sk_ad_network_items: [],
        },
      ],
    ],
  },
};
