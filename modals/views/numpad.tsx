import { Button, Coin, Numpad } from '../../components';
import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderColor, fontColor, numericFontFamily, secondaryFontColor } from '../../constants/styles';

import BackButton from '../components/BackButton';
import Swiper from 'react-native-swiper';
import { TokensView } from './amount';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface SubViewProps {
  onBack?: () => void;
  onNext?: () => void;
  onTokenPress?: () => void;
  onTokenBack?: () => void;
  disableBack?: boolean;
  disableBalance?: boolean;
}

export const NumpadView = observer((props: SubViewProps) => {
  return (
    <View style={styles.container}>
      <View style={{ ...styles.navBar }}>
        {props.disableBack ? <View /> : <BackButton onPress={props.onBack} />}

        <TouchableOpacity style={styles.navMoreButton} onPress={props.onTokenPress}>
          <Text style={{ fontSize: 19, marginEnd: 8, color: secondaryFontColor, fontWeight: '500' }}>USDC</Text>

          <Coin symbol="USDC" style={{ width: 22, height: 22 }} />
        </TouchableOpacity>
      </View>

      <Text
        style={{
          fontSize: 42,
          fontFamily: numericFontFamily,
          fontWeight: '600',
          marginVertical: 4,
          textAlign: 'center',
          color: '#627EEA',
        }}
        numberOfLines={1}
      >
        123,456.78
      </Text>

      <Numpad onPress={(_) => {}} />

      <Button title="Next" />
    </View>
  );
});

interface Props {
  onNext?: () => void;
}

export default observer((props: Props) => {
  const swiper = useRef<Swiper>(null);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <NumpadView onNext={props.onNext} disableBack />
      <TokensView />
    </Swiper>
  );
});

const viewStyles = StyleSheet.create({
  numpadContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 10,
    borderColor,
    borderWidth: 1,
    marginBottom: 12,
    flexWrap: 'wrap',
  },

  keyboard: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '33.3%',
    height: '25%',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor,
  },

  num: {
    fontSize: 20,
    color: fontColor,
    fontWeight: '600',
    textAlign: 'center',
  },
});
