module.exports = {
  directories: {
    app: '.',
  },
  files: ['./.webpack/**/*', './package.json'],
  appId: 'jp.co.chainbow.wallet3',
  productName: 'Wallet 3',
  artifactName: '${name}-${os}-${arch}-${version}.${ext}',
  copyright: 'Copyright © 2021 ChainBow Co. Ltd.',
  asar: false,
  protocols: {
    name: 'Wallet 3',
    schemes: ['wallet3', 'wc', 'ledgerlive'],
  },
  //npmRebuild: 'false',
  //afterSign: "sign/appSign.js",
  mac: {
    icon: 'assets/AppIcon.icns',
    // background: 'assets/DMGBG.png',
    // backgroundColor: '#6186ff',
    entitlements: 'sign/entitlements.plist',
    category: 'public.app-category.finance',
    target: [
      'dmg',
      // 'zip',
      // 'mas'
    ],
    publish: ['github'],
  },
  mas: {
    entitlements: 'sign/entitlements.mas.plist',
  },
  win: {
    target: ['nsis'],
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
    displayName: 'Wallet 3',
    publisher: 'CN',
    publisherDisplayName: 'ChainBow Co, Ltd.',
  },
};
