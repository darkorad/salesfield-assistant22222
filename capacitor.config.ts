
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.zirmd.salesfield',
  appName: 'ŽIR-MD Sales',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: [
      "*.supabase.co"
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: "#FFFFFF",
      showSpinner: true,
      spinnerColor: "#9b87f5",
      splashFullScreen: true,
      splashImmersive: true
    },
    CapacitorHttp: {
      enabled: true
    },
    CapacitorCookies: {
      enabled: true
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    useLegacyBridge: false,
    webContentsDebuggingEnabled: true
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: true,
    handleApplicationNotifications: true
  }
};

export default config;
