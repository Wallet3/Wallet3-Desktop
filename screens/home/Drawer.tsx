import App, { AppVM } from '../../viewmodels/App';
import { Arbitrum, Ethereum, NetworkIcons, Optimism } from '../../assets/icons/networks/color';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { borderColor, fontColor, secondaryFontColor } from '../../constants/styles';

import { DrawerActions } from '@react-navigation/core';
import { Feather } from '@expo/vector-icons';
import { INetwork } from '../../common/Networks';
import Networks from '../../viewmodels/Networks';
import PubSub from 'pubsub-js';
import React from 'react';
import { SafeViewContainer } from '../../components';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';

const { bottom, top } = initialWindowMetrics?.insets ?? { bottom: 0, top: 0 };
const screenHeight = Dimensions.get('window').height - (bottom + top);

interface DrawerProps extends DrawerContentComponentProps {
  appVM: AppVM;
}

const Drawer = observer((props: DrawerProps) => {
  const { navigation, appVM } = props;
  const { currentWallet } = appVM;
  const { current } = Networks;

  const { index } = navigation.getState();

  const homeHighlight = index === 0 ? current.color : fontColor;
  const settingsHighlight = index === 1 ? current.color : fontColor;

  const fastSwitchNetwork = (network: INetwork) => {
    Networks.switch(network);
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  return (
    <SafeViewContainer style={{ flex: 1, height: screenHeight, paddingHorizontal: 0, paddingTop: 0 }}>
      <View
        style={{
          marginHorizontal: 16,
          alignItems: 'center',
          flexDirection: 'row',
          marginBottom: 8,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        }}
      >
        <Image
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: current.color,
          }}
          source={
            {
              uri:
                currentWallet?.currentAccount?.avatar ||
                'https://lh3.googleusercontent.com/1cYgtxvPgxU3tlU6r4trPcl9cU0xFpkUKpba0QPSbBFx_OC-347VQq9MuAA0Y4KoE1zsGUcmmik-XJJw1wG1qv75BsSefDX26VbLnw=w600',
            }
            // currentWallet?.currentAccount?.avatar,
          }
        />

        <Text
          style={{
            fontWeight: '500',
            marginStart: 12,
            fontSize: 17,
            maxWidth: '70%',
          }}
          numberOfLines={1}
        >
          {currentWallet?.currentAccount?.displayName}
        </Text>
      </View>

      <View style={{ paddingBottom: 12 }}>
        <DrawerItem
          label="Wallet"
          onPress={() => navigation.navigate('Home')}
          labelStyle={{ ...styles.drawerLabel, color: homeHighlight }}
          icon={() => <Feather color={homeHighlight} size={21} name={'credit-card'} />}
        />

        <DrawerItem
          label="Settings"
          onPress={() => navigation.navigate('Settings')}
          labelStyle={{ ...styles.drawerLabel, color: settingsHighlight }}
          icon={() => <Feather color={settingsHighlight} size={21} name={'settings'} />}
        />
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ padding: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: secondaryFontColor, fontSize: 14 }}>Networks</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => fastSwitchNetwork(Networks.Ethereum)} style={styles.smallNetworkContainer}>
              <Ethereum width={14} height={14} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => fastSwitchNetwork(Networks.Arbitrum)} style={styles.smallNetworkContainer}>
              <Arbitrum width={14} height={14} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => fastSwitchNetwork(Networks.Optimism)} style={styles.smallNetworkContainer}>
              <Optimism width={14} height={13} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: borderColor, marginVertical: 4, marginBottom: 8 }} />
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => {
            navigation.dispatch(DrawerActions.closeDrawer());
            PubSub.publish('openNetworksModal');
          }}
        >
          {NetworkIcons[current.network.toLowerCase()]}
          <Text style={{ marginStart: 8, fontSize: 16, color: current.color, fontWeight: '500' }}>{current.network}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}></View>

          <Feather name="chevron-right" size={16} color={current.color} style={{ marginBottom: -2 }} />
        </TouchableOpacity>
      </View>
    </SafeViewContainer>
  );
});

export default (props: DrawerContentComponentProps) => {
  return (
    <DrawerContentScrollView {...props} scrollEnabled={false}>
      <Drawer {...props} appVM={App} />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  smallNetworkContainer: {
    marginHorizontal: 4,
  },

  drawerLabel: {
    fontFamily: 'PingFang HK',
    fontSize: 17,
    marginStart: -16,
    color: fontColor,
  },
});
