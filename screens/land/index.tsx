import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useRef } from 'react';

import Backup from './backup';
import CreateWallet from './createWallet';
import ImportWallet from './importWallet';
import { Ionicons } from '@expo/vector-icons';
import SetupPasscode from './passcode';
import { TouchableOpacity } from 'react-native';
import Welcome from './welcome';

type RootStackParamList = {
  Home: undefined;
  Welcome: undefined;
  Feed: { sort: 'latest' | 'top' } | undefined;
};

const { Navigator, Screen } = createNativeStackNavigator();

export default ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Welcome'>) => {
  return (
    <Navigator
      screenOptions={{
        headerTransparent: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.pop()}>
            <Ionicons name="arrow-back-outline" size={20} />
          </TouchableOpacity>
        ),
      }}
      initialRouteName="Welcome"
    >
      <Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
      <Screen name="ImportWallet" component={ImportWallet} options={{ title: 'Import a wallet' }} />
      <Screen name="CreateWallet" component={CreateWallet} options={{ title: 'Create a new wallet' }} />
      <Screen name="Backup" component={Backup} options={{ title: 'Backup your secret' }} />
      <Screen name="SetupPasscode" component={SetupPasscode} options={{ title: 'Set up passcode' }} />
    </Navigator>
  );
};