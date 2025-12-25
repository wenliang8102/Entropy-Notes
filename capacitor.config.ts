import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.entropy.notes',
  appName: 'Entropy Notes',
  webDir: 'dist',
  server: {
    cleartext: true,
    androidScheme: 'http'
  }

};

export default config;
