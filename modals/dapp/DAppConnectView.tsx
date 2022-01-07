import { Button, SafeViewContainer } from '../../components';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { themeColor, thirdFontColor } from '../../constants/styles';

import { Account } from '../../viewmodels/account/Account';
import { INetwork } from '../../common/Networks';
import Image from 'react-native-expo-cached-image';
import React from 'react';
import { formatAddress } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';

interface Props {
  account?: Account;
  network: INetwork;
  onAccountsPress?: () => void;
  onNetworksPress?: () => void;
  appName?: string;
  appIcon?: string;
  appDesc?: string;
  appUrl?: string;
  onConnect?: () => void;
  onReject?: () => void;
  disableNetworksButton?: boolean;
  disableAccountsButton?: boolean;
}

export default ({
  account,
  network,
  onAccountsPress,
  onNetworksPress,
  appName,
  appIcon,
  appDesc,
  appUrl,
  onConnect,
  onReject,
  disableNetworksButton,
  disableAccountsButton,
}: Props) => {
  const { t } = i18n;

  return (
    <SafeViewContainer style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <TouchableOpacity
          style={{ paddingVertical: 6, flexDirection: 'row', alignItems: 'center' }}
          onPress={onAccountsPress}
          disabled={disableAccountsButton}
        >
          {account?.avatar ? (
            <Image source={{ uri: account.avatar }} style={{ width: 16, height: 16, marginEnd: 6, borderRadius: 100 }} />
          ) : undefined}

          <Text style={{ color: thirdFontColor, maxWidth: 150 }}>
            {account?.ens.name || formatAddress(account?.address ?? '', 6, 5)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNetworksPress}
          disabled={disableNetworksButton}
          style={{
            padding: 6,
            paddingHorizontal: 12,
            borderColor: `${network.color}90`,
            borderWidth: 1,
            borderRadius: 100,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {generateNetworkIcon({ chainId: network.chainId, width: 16, height: 16, color: network.color })}
          <Text style={{ color: network.color, marginStart: 6 }}>{`${network.network}`}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      <Image source={{ uri: appIcon }} style={{ width: 72, height: 72, marginBottom: 12, borderRadius: 7 }} />

      <Text style={{ ...viewStyles.txt, fontSize: 24, fontWeight: '500', opacity: 1 }} numberOfLines={1}>{appName}</Text>

      <Text style={viewStyles.txt} numberOfLines={1}>
        {appUrl}
      </Text>

      {appDesc ? (
        <Text style={viewStyles.txt} numberOfLines={2}>
          {appDesc}
        </Text>
      ) : undefined}

      <View style={{ flex: 1 }} />

      <View style={{ width: '100%' }}>
        <Button title={t('button-connect')} onPress={onConnect} />
        <Button title={t('button-reject')} themeColor={themeColor} onPress={onReject} style={{ marginTop: 12 }} reverse />
      </View>
    </SafeViewContainer>
  );
};

const viewStyles = StyleSheet.create({
  txt: {
    color: thirdFontColor,
    opacity: 0.75,
    fontSize: 17,
    maxWidth: '100%',
    marginBottom: 12,
    textAlign: 'center',
  },
});