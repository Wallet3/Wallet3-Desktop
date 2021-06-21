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
  copyright: 'Copyright © 2021 ChainBow Co. Ltd.',
  protocols: {
    name: 'ChainBow',
    schemes: [ 'ethereum', 'wallet3' ]
  },
  mac: {
    icon: 'assets/AppIcon.icns',
    category: 'public.app-category.productivity',
    artifactName: '${productName}-${platform}-${arch}-${version}.${ext}',
    target: [
      'dmg',
      'zip',
      // 'mas'
    ],
    publish: [ 'github' ]
  },
  win: {
    target: 'nsis',
    icon: 'assets/AppIcon.ico',
    artifactName: '${productName}-${platform}-${arch}-${version}.${ext}',
    publish: [ 'github' ]
  },
  linux: {
    target: 'AppImage',
    artifactName: '${productName}-${platform}-${arch}-${version}.${ext}',
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