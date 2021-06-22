module.exports = {
  directories:{
    app: '.',
  },
  files:[
    "./.webpack/**/*",
    "./package.json",
  ],
  appId: 'jp.co.chainbow.wallet3',
  productName: 'Wallet 3',
  artifactName: '${name}-${os}-${arch}-${version}.${ext}',
  copyright: 'Copyright © 2021 ChainBow Co. Ltd.',
  protocols: {
    name: 'ChainBow',
    schemes: [ 'ethereum', 'wallet3' ]
  },
  npmRebuild: 'false',
  afterSign: "sign/appSign.js",
  mac: {
    icon: 'assets/AppIcon.icns',
    // background: 'assets/DMGBG.png',
    // backgroundColor: '#6186ff',
    //entitlements: "sign/entitlements.plist",
    category: 'public.app-category.finance',
    target: [
      'dmg',
      'zip',
      // 'mas'
    ],
    publish: [ 'github' ],
  },
  win: {
    target: 'nsis',
    icon: 'assets/AppIcon.ico',
    publish: [ 'github' ]
  },
  linux: {
    target: 'AppImage',
    icon: 'assets/AppIcon.png',
    publish: [ 'github' ]
  },
  nsis: {
    deleteAppDataOnUninstall: true,
    createDesktopShortcut: 'always'
    // include: 'nsis.nsh'
  },
  publish: null
}