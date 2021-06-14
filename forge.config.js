const { appleId, appleIdPassword } = require('./sign/appSign');

module.exports = {
  packagerConfig: {
    appBundleId: 'jp.co.chainbow.wallet3',
    appCopyright: 'ChainBow Co, Ltd.',
    appCategoryType: 'public.app-category.finance',
    darwinDarkModeSupport: false,
    icon: './assets/AppIcon.png',
    osxSign: {
      identity: 'Developer ID Application: ChainBow Co. Ltd (Z3N6SZF439)',
      hardenedRuntime: true,
      'gatekeeper-assess': false,
      entitlements: 'sign/entitlements.plist',
      'entitlements-inherit': 'sign/entitlements.plist',
      'signature-flags': 'library',
    },
    osxNotarize: {
      appleId,
      appleIdPassword,
    },
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'Wallet 3',
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {},
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    [
      '@electron-forge/plugin-webpack',
      {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.ts',
              name: 'main_window',
              preload: {
                js: './src/preload.ts',
              },
            },
            {
              html: './src/index.html',
              js: './src/popup_renderer.ts',
              name: 'popup_window',
              preload: {
                js: './src/preload.ts',
              },
            },
          ],
        },
      },
    ],
  ],
  win32metadata: {
    CompanyName: 'ChainBow',
  },
};
