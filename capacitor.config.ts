import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ourworld.app',
  appName: 'Our World',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#faf8f7',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#faf8f7',
    },
  },
};

export default config;
