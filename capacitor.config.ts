import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.graceconnect.app',
  appName: 'Grace Connect',
  webDir: 'public',
  server: {
    url: 'https://graceconnect-psi.vercel.app',
    cleartext: true
  }
};

export default config;
