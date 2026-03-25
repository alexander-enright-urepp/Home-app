import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.opc.home',
  appName: 'Home',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'homeapp'
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#000000'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP'
    }
  }
};

export default config;
