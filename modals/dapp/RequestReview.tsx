import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Coin, SafeViewContainer, Skeleton } from '../../components';
import React, { useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { borderColor, fontColor } from '../../constants/styles';

import AnimateNumber from 'react-native-animate-number';
import Currency from '../../viewmodels/Currency';
import GasReview from '../views/GasReview';
import { INetwork } from '../../common/Networks';
import Image from 'react-native-expo-cached-image';
import InsufficientFee from '../components/InsufficientFee';
import RejectApproveButtons from '../components/RejectApproveButtons';
import Swiper from 'react-native-swiper';
import { TransactionRequest } from '../../viewmodels/TransactionRequest';
import TxException from '../components/TxException';
import { WCCallRequestRequest } from '../../models/WCSession_v1';
import { WalletConnect_v1 } from '../../viewmodels/WalletConnect_v1';
import { constants } from 'ethers';
import { formatAddress } from '../../utils/formatter';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface Props {
  vm: TransactionRequest;
  onReject?: () => void;
  onApprove?: () => void;
  onGasPress?: () => void;
}

const TxReview = observer(({ vm, onReject, onApprove, onGasPress }: Props) => {
  const { appMeta, network } = vm;

  return (
    <SafeViewContainer>
      <View style={styles.reviewItemsContainer}>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewItemTitle}>DApp</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: appMeta?.icons[0] }} style={{ width: 19, height: 19, marginEnd: 4 }} />
            <Text style={{ ...styles.reviewItemValue, maxWidth: 180 }} numberOfLines={1}>
              {appMeta?.name}
            </Text>
          </View>
        </View>

        <View style={{ ...styles.reviewItem }}>
          <Text style={styles.reviewItemTitle}>Type</Text>
          <Text style={{ ...styles.reviewItemValue }} numberOfLines={1}>
            {vm.type}
          </Text>
        </View>

        {vm.type === 'Transfer' ? (
          <View style={{ ...styles.reviewItem }}>
            <Text style={styles.reviewItemTitle}>Amount</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {vm.tokenAmountWei.gt(0) ? (
                <Text style={{ ...styles.reviewItemValue }} numberOfLines={1}>
                  {`${vm.tokenAmount} ${vm.tokenSymbol}`}
                </Text>
              ) : undefined}

              {vm.tokenAmountWei.gt(0) && vm.valueWei.gt(0) ? (
                <Text style={{ ...styles.reviewItemValue, marginHorizontal: 6 }}>+</Text>
              ) : undefined}

              {vm.valueWei.gt(0) || vm.tokenAmountWei.eq(0) ? (
                <Text style={{ ...styles.reviewItemValue }} numberOfLines={1}>{`${vm.value} ${vm.network.symbol}`}</Text>
              ) : undefined}
            </View>
          </View>
        ) : undefined}

        {vm.type === 'Approve' ? (
          <View style={{ ...styles.reviewItem }}>
            <Text style={styles.reviewItemTitle}>Max</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                numberOfLines={1}
                defaultValue={vm.maxUint256Amount ? 'Unlimited' : vm.tokenAmount}
                keyboardType="decimal-pad"
                onChangeText={(t) => vm.setApproveAmount(t)}
                textAlign="right"
                style={{
                  ...styles.reviewItemValue,
                  maxWidth: 120,
                  color: vm.maxUint256Amount ? 'deeppink' : fontColor,
                  marginEnd: 4,
                  minWidth: 52,
                }}
              />

              {vm.tokenSymbol ? <Coin symbol={vm.tokenSymbol} size={20} /> : undefined}
              {vm.tokenSymbol ? (
                <Text style={{ ...styles.reviewItemValue, marginStart: 2, maxWidth: 64 }} numberOfLines={1}>
                  {vm.tokenSymbol}
                </Text>
              ) : (
                <Skeleton style={{ width: 52, height: 19, marginStart: 4 }} />
              )}
            </View>
          </View>
        ) : undefined}

        {vm.type !== 'Contract Interaction' ? (
          <View style={{ ...styles.reviewItem }}>
            <Text style={styles.reviewItemTitle}>To</Text>
            <Text style={{ ...styles.reviewItemValue }} numberOfLines={1}>
              {formatAddress(vm.to, 9, 5)}
            </Text>
          </View>
        ) : (
          <View style={{ ...styles.reviewItem }}>
            <Text style={styles.reviewItemTitle}>Value</Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ ...styles.reviewItemValue, maxWidth: 120, marginEnd: 4 }} numberOfLines={1}>
                {vm.value}
              </Text>

              <Text style={{ ...styles.reviewItemValue }} numberOfLines={1}>
                {vm.network.symbol}
              </Text>
            </View>
          </View>
        )}

        <View style={{ ...styles.reviewItem, borderBottomWidth: 0 }}>
          <Text style={styles.reviewItemTitle}>Network</Text>
          <Text style={{ ...styles.reviewItemValue, color: network?.color }} numberOfLines={1}>
            {network?.network}
          </Text>
        </View>
      </View>

      <View
        style={{
          ...styles.reviewItemsContainer,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingStart: 16,
        }}
      >
        <Text style={styles.reviewItemTitle}>Tx Fee</Text>

        <TouchableOpacity
          onPress={onGasPress}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            paddingVertical: 12,
            paddingEnd: 14,
            justifyContent: 'flex-end',
            width: '75%',
          }}
        >
          <Text style={{ ...styles.reviewItemTitle, fontSize: 15 }}>
            {`(${Currency.tokenToUSD(vm.txFee, vm.network.symbol).toFixed(2)} USD)`}
          </Text>

          <AnimateNumber
            style={{ ...styles.reviewItemValue, marginHorizontal: 2 }}
            numberOfLines={1}
            value={vm.txFee}
            formatter={(val) => `${val.toFixed(5)} ${vm.feeTokenSymbol}`}
          />

          <MaterialIcons name="keyboard-arrow-right" size={15} />
        </TouchableOpacity>
      </View>

      {vm.insufficientFee ? <InsufficientFee /> : undefined}

      {vm.txException ? <TxException exception={vm.txException} /> : undefined}

      <View style={{ flex: 1 }} />

      <RejectApproveButtons
        onReject={onReject}
        onApprove={onApprove}
        themeColor={network?.color}
        rejectTitle="Reject"
        approveTitle="Send"
        disabledApprove={!vm.isValidParams}
      />
    </SafeViewContainer>
  );
});

export default observer((props: Props) => {
  const swiper = useRef<Swiper>(null);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <TxReview {...props} onGasPress={() => swiper.current?.scrollTo(1)} />
      <GasReview onBack={() => swiper.current?.scrollTo(0)} vm={props.vm} />
    </Swiper>
  );
});