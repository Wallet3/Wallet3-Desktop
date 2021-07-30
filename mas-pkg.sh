#!/bin/bash

printf "......................\nresignAndPackage start\n\n"

# Name of your app.
APP="Wallet 3"
# Your Certificate name.
CERT="ChainBow Co. Ltd (Z3N6SZF439)"
# The path of your app to sign.
APP_PATH="./out/Wallet 3-mas-arm64/$APP.app"
# The path to the location you want to put the signed package.
RESULT_PATH="./out/Wallet 3-mas-arm64/$APP-mac_store.pkg"
# The name of certificates you requested.
APP_KEY="3rd Party Mac Developer Application: $CERT"
INSTALLER_KEY="3rd Party Mac Developer Installer: $CERT"
# The path of your plist files.
PARENT_PLIST="sign/entitlements.mas.plist"
CHILD_PLIST="sign/entitlements.mas.plist"
LOGINHELPER_PLIST="build/entitlements.mas.loginhelper.plist"
FRAMEWORKS_PATH="$APP_PATH/Contents/Frameworks"

productbuild --component "$APP_PATH" /Applications --sign "$INSTALLER_KEY" "$RESULT_PATH"

printf "\nresignAndPackage end\n......................\n"
