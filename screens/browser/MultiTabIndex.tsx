import { Animated, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { BottomTabScreenProps, useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useRef, useState } from 'react';
import { action, makeObservable, observable } from 'mobx';

import { Browser } from './Browser';
import { Modalize } from 'react-native-modalize';
import { PageMetadata } from './Web3View';
import { Portal } from 'react-native-portalize';
import { ReactiveScreen } from '../../utils/device';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import { WebTabs } from './components/Tabs';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export class StateViewModel {
  private id = 1;

  tabCount = 1;
  tabBarHidden = false;

  pageMetas = new Map<number, PageMetadata | undefined>();
  pageCaptureFuncs = new Map<number, (() => Promise<string>) | undefined>();
  pageSnapshots = new Map<number, string | undefined>();

  constructor() {
    makeObservable(this, { tabCount: observable, setTabCount: action });
  }

  setTabCount(count: number) {
    this.tabCount = count;
  }

  genId() {
    const id = this.id;
    this.id++;

    return id;
  }
}

export default observer((props: BottomTabScreenProps<{}, never>) => {
  const { navigation } = props;
  const swiper = useRef<FlatList>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [counts, setCounts] = useState(1);
  const [state] = useState(new StateViewModel());
  const { backgroundColor } = Theme;

  const [tabBarHeight] = useState(useBottomTabBarHeight());
  const { bottom: safeAreaBottom } = useSafeAreaInsets();
  const { ref: tabsRef, open: openTabs, close: closeTabs } = useModalize();

  const generateBrowserTab = (id: number, props: BottomTabScreenProps<{}, never>, onNewTab: () => void) => (
    <Browser
      {...props}
      key={`Browser-${id}`}
      tabId={id}
      onPageLoaded={(index, meta) => state.pageMetas.set(id, meta)}
      onNewTab={onNewTab}
      globalState={state}
      onOpenTabs={openTabs}
      onTakeOff={() => hideTabBar()}
      setCapture={(func) => state.pageCaptureFuncs.set(id, func)}
      onPageLoadEnd={() =>
        setTimeout(
          () =>
            state.pageCaptureFuncs
              .get(id)?.()
              .then((snapshot) => state.pageSnapshots.set(id, snapshot)),
          1000
        )
      }
      onHome={() => {
        showTabBar();
        state.pageMetas.set(id, undefined);
        state.pageCaptureFuncs.set(id, undefined);
        state.pageSnapshots.set(id, undefined);
      }}
    />
  );

  const newTab = () => {
    const id = state.genId();
    const tabView = generateBrowserTab(id, props, newTab);

    tabs.set(id, tabView);
    state.pageMetas.set(id, undefined);

    setCounts(tabs.size);
    state.setTabCount(tabs.size);

    setTimeout(() => {
      // swiper.current?.scrollToIndex({ index: tabs.size - 1, animated: true });
      swiper.current?.scrollToItem({ item: tabView, animated: true });
      setTimeout(() => setActiveTabIndex(tabs.size - 1), 200); // Important!!!
    }, 500);
  };

  const hideTabBar = () => {
    if (state.tabBarHidden) return;

    const { backgroundColor, systemBorderColor } = Theme;

    PubSub.publish('drawer-swipeEnabled', false);
    state.tabBarHidden = true;

    const translateY = new Animated.Value(0);
    Animated.spring(translateY, { toValue: tabBarHeight, useNativeDriver: true }).start();

    setTimeout(() => {
      navigation.setOptions({
        tabBarStyle: safeAreaBottom
          ? { height: 0, backgroundColor, borderTopColor: systemBorderColor }
          : { height: 0, backgroundColor, borderTopColor: systemBorderColor, borderTopWidth: 0 },
      });
    }, 100);

    navigation.setOptions({
      tabBarStyle: { transform: [{ translateY }], backgroundColor, borderTopColor: systemBorderColor },
    });
  };

  const showTabBar = () => {
    if (!state.tabBarHidden) return;

    const { backgroundColor, systemBorderColor } = Theme;

    PubSub.publish('drawer-swipeEnabled', true);
    state.tabBarHidden = false;

    const translateY = new Animated.Value(tabBarHeight);
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();

    navigation.setOptions({
      tabBarStyle: { transform: [{ translateY }], height: tabBarHeight, backgroundColor, borderTopColor: systemBorderColor },
    });
  };

  const [tabs] = useState(new Map<number, JSX.Element>([[0, generateBrowserTab(0, props, newTab)]]));

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <FlatList
        key="browser-pivot"
        ref={swiper}
        data={Array.from(tabs.values())}
        renderItem={({ item }) => item}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        initialScrollIndex={0}
      />

      <Portal>
        <Modalize
          ref={tabsRef}
          adjustToContentHeight
          disableScrollIfPossible
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
          modalStyle={{ padding: 0, margin: 0 }}
        >
          <WebTabs
            globalState={state}
            onNewTab={() => {
              newTab();
              closeTabs();
            }}
            onJumpToPage={(index) => {
              swiper.current?.scrollToIndex({ index, animated: true });
              closeTabs();
            }}
            onRemovePage={(pageId) => {
              tabs.delete(pageId);
              state.pageMetas.delete(pageId);
              state.pageCaptureFuncs.delete(pageId);
              state.pageSnapshots.delete(pageId);
              state.setTabCount(tabs.size);
              setCounts(tabs.size);

              if (tabs.size === 0) newTab();

              closeTabs();
            }}
          />
        </Modalize>
      </Portal>
    </View>
  );
});

const TestStateView = ({
  onNewTab,
  onRemoveTab,
  id,
}: {
  id: any;
  props: any;
  onNewTab: () => void;
  onRemoveTab: () => void;
}) => {
  const [count, setCount] = useState(0);

  console.log('rendering', id);
  return (
    <View key={id} style={{ width: ReactiveScreen.width }}>
      <TouchableOpacity onPress={() => setCount((prev) => prev + 1)}>
        <Text style={{ fontSize: 81 }}>{count}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onNewTab}>
        <Text>New Tab</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onRemoveTab} style={{ marginTop: 24 }}>
        <Text>Remove Tab</Text>
      </TouchableOpacity>
    </View>
  );
};
