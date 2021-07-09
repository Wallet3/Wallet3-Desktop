const { appleId, appleIdPassword } = require('./sign/appSign');
const package = require('./package.json');

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
    // osxNotarize: {
    //   appleId,
    //   appleIdPassword,
    // },
    protocols: [
      {
        name: 'Wallet 3',
        protocol: 'wallet3',
        schemes: ['wallet3', 'wc'],
      },
    ],
  },
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      config: {
        name: `${package.name}-mac-${process.arch}-${package.version}`,
        icon: 'assets/AppIcon.icns',
        background: 'assets/DMGBG.png',
        backgroundColor: '#6186ff',
      },
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
    CompanyName: 'ChainBow Co, Ltd.',
  },
};
