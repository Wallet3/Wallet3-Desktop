const { certPassword, devCertPath, publisher, publisherName } = require('./sign/winSign');

module.exports = {
  directories: {
    app: '.',
  },
  files: ['./.webpack/**/*', './package.json', './sign/embedded.provisionprofile'],
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
    entitlements: 'sign/entitlements.mas.plist',
    category: 'public.app-category.finance',
    identity: 'ChainBow Co. Ltd (Z3N6SZF439)',
    target: ['mas'],
    publish: ['github'],
  },
  mas: {
    type: 'distribution',
    identity: 'ChainBow Co. Ltd (Z3N6SZF439)',
    entitlements: 'sign/entitlements.mas.plist',
    entitlementsInherit: 'sign/entitlements.mas.inherit.plist',
    provisioningProfile: 'sign/embedded.provisionprofile',

    asar: {
      smartUnpack: true,
    },
    asarUnpack: ['**/*.node'],
  },
  win: {
    target: ['appx', 'nsis'],
    icon: 'assets/win/AppIcon.png',
    publish: ['github'],
    legalTrademarks: 'Wallet 3, ChainBow Co, Ltd.',
    certificateFile: devCertPath,
    certificatePassword: certPassword,

    asar: {
      smartUnpack: true,
    },
    asarUnpack: ['**/*.node'],
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
    identityName: 'ChainBowCo.Ltd.8951B06B2934',
    displayName: 'Wallet 3',
    publisher: publisher,
    publisherDisplayName: 'ChainBow Co. Ltd.',
    setBuildNumber: true,
  },
};
