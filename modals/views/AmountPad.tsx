import { Button, Coin, Numpad, SafeViewContainer } from '../../components';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { numericFontFamily, secondaryFontColor, themeColor } from '../../constants/styles';

import BackButton from '../components/BackButton';
import { IToken } from '../../common/Tokens';
import Networks from '../../viewmodels/Networks';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface SubViewProps {
  onBack?: () => void;
  onNext?: () => void;
  onTokenPress?: () => void;
  onTokenBack?: () => void;
  token: IToken;
  disableBack?: boolean;
  disableBalance?: boolean;
  disableButton?: boolean;
  max?: string;
  onMaxPress?: () => void;
  onNumChanged?: (num: string) => void;
}

export default observer((props: SubViewProps) => {
  const [amount, setAmount] = useState('0');

  const onNumPress = (num: string) => {
    if (num === '.') {
      if (amount.includes('.')) return;
      setAmount((pre) => pre + '.');
      return;
    }

    if (num === 'del') {
      setAmount((pre) => pre.slice(0, -1) || '0');
      return;
    }

    if (num === 'clear') {
      setAmount('0');
      return;
    }

    setAmount((pre) => {
      const combined = `${pre}${num}`;
      return combined.startsWith('0') && !combined.startsWith('0.') ? Number(combined).toString() : combined;
    });
  };

  useEffect(() => {
    props.onNumChanged?.(amount);
  }, [amount]);

  return (
    <SafeViewContainer style={styles.container}>
      <View style={{ ...styles.navBar }}>
        {props.disableBack ? <View /> : <BackButton onPress={props.onBack} color={Networks.current.color} />}

        <TouchableOpacity style={styles.navMoreButton} onPress={props.onTokenPress}>
          <Text
            style={{ fontSize: 19, marginEnd: 8, color: secondaryFontColor, fontWeight: '500', maxWidth: 200 }}
            numberOfLines={1}
          >
            {props.token?.symbol}
          </Text>

          <Coin symbol={props.token?.symbol} style={{ width: 22, height: 22 }} forceRefresh />
        </TouchableOpacity>
      </View>

      <Text
        numberOfLines={1}
        style={{
          fontSize: 64,
          fontFamily: numericFontFamily,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: -14,
          textAlign: 'center',
          color: themeColor,
        }}
      >
        {amount}
      </Text>

      {props.max ? (
        <TouchableOpacity
          onPress={() => {
            props.onMaxPress?.();
            setAmount(props.max!);
          }}
          style={{ justifyContent: 'flex-end', flexDirection: 'row', paddingEnd: 4 }}
        >
          <Text style={{ color: secondaryFontColor }}>{`Max: ${props.max}`}</Text>
        </TouchableOpacity>
      ) : undefined}

      <View style={{ flex: 1 }} />

      <Numpad onPress={onNumPress} />

      <Button
        title="Next"
        onPress={props.onNext}
        disabled={props.disableButton}
        themeColor={Networks.current.color}
        style={{ marginTop: 12 }}
      />
    </SafeViewContainer>
  );
});