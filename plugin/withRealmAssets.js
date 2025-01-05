const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withRealmAssets = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const assetsDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/assets');
      
      // Create assets directory if it doesn't exist
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }

      // Copy your Realm file to assets directory
      const sourcePath = path.join(config.modRequest.projectRoot, 'assets/realm/prepopulated.realm');
      const destPath = path.join(assetsDir, 'prepopulated.realm');

      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log('Copied Realm database to Android assets');
      } else {
        console.warn('Source Realm database not found');
      }

      return config;
    },
  ]);
};

module.exports = withRealmAssets;