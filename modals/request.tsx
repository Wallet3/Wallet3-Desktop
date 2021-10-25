import { AmountPad, NFCPad } from './views';
import React, { useRef } from 'react';

import { Numpad } from './views';
import { SafeAreaView } from 'react-native';
import Swiper from 'react-native-swiper';
import { observer } from 'mobx-react-lite';

export default observer(() => {
  const swiper = useRef<Swiper>(null);

  return (
    <SafeAreaView style={{ height: 439 }}>
      <Swiper
        ref={swiper}
        showsPagination={false}
        showsButtons={false}
        scrollEnabled={false}
        loop={false}
        automaticallyAdjustContentInsets
      >
        <Numpad onNext={() => swiper.current?.scrollTo(1)} />
        <NFCPad onBack={() => swiper.current?.scrollTo(0)} />
      </Swiper>
    </SafeAreaView>
  );
});
