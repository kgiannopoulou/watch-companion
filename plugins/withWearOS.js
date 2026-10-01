// Turns the Android build into a standalone Wear OS app (https://developer.android.com/training/wearables/apps/standalone-apps).
// Only native builds use this; Expo Go on a phone ignores it.
const { AndroidConfig, withAndroidManifest } = require('expo/config-plugins');

module.exports = function withWearOS(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const features = (manifest['uses-feature'] = manifest['uses-feature'] ?? []);
    if (!features.some((f) => f.$['android:name'] === 'android.hardware.type.watch')) {
      features.push({ $: { 'android:name': 'android.hardware.type.watch' } });
    }
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    // Works without a paired phone app.
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(app, 'com.google.android.wearable.standalone', 'true');
    return cfg;
  });
};
