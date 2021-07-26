module.exports = {
  directories: {
    app: '.',
  },
  files: ['./.webpack/**/*', './package.json'],
  appId: 'jp.co.chainbow.wallet3',
  productName: 'Wallet 3',
  artifactName: '${name}-${os}-${arch}-${version}.${ext}',
  copyright: 'Copyright © 2021 ChainBow Co. Ltd.',
  protocols: {
    name: 'Wallet 3',
    schemes: ['ethereum', 'wallet3', 'wc', 'ledgerlive'],
  },
  //npmRebuild: 'false',
  //afterSign: "sign/appSign.js",
  mac: {
    icon: 'assets/AppIcon.icns',
    entitlements: 'sign/entitlements.plist',
    category: 'public.app-category.finance',
    target: [
      'mas',
      // 'dmg', // https://github.com/electron/electron-osx-sign/issues/223#issuecomment-611070794
    ],
    publish: ['github'],
  },
  mas: {
    entitlements: 'sign/entitlements.mas.plist',
    type: 'distribution',
    identity: 'Apple Distribution: ChainBow Co. Ltd (Z3N6SZF439)',
    provisioningProfile: '',
  },
  win: {
    target: ['nsis', 'appx'],
    icon: 'assets/AppIcon.ico',
    publish: ['github'],
    legalTrademarks: 'Wallet 3, ChainBow Co, Ltd.',
  },
  linux: {
    target: 'AppImage',
    icon: 'assets/AppIcon.png',
    publish: ['github'],
  },
  nsis: {
    deleteAppDataOnUninstall: true,
    createDesktopShortcut: 'always',
    // include: 'nsis.nsh'
  },
  appx: {
    applicationId: 'ChainBowCo.Ltd.Wallet3',
    identityName: 'ChainBowCo.Ltd.Wallet3',
    displayName: 'Wallet 3',
    publisher: 'CN=0C3D219C-15E2-4A43-ACCA-85E854FA9BA4',
    publisherDisplayName: 'ChainBow Co. Ltd.',
  },
};
