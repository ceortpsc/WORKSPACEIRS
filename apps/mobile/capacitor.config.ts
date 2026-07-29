import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.RTPSC_MOBILE_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.rosstaxpro.workspaceirs',
  appName: 'Ross Tax Pro',
  webDir: '../../apps/web/out',
  bundledWebRuntime: false,
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: false,
        allowNavigation: ['*.rosstaxsoftware.com', '*.rosstaxprosoftware.com']
      }
    : undefined,
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile'
  },
  android: {
    allowMixedContent: false,
    captureInput: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#071D3B',
      showSpinner: false
    },
    Keyboard: {
      resize: 'body'
    }
  }
};

export default config;
