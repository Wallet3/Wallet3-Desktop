import { Button, Image, StyleSheet, Text, View } from "react-native";
import {
  DrawerContent,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  DrawerNavigationProp,
  DrawerScreenProps,
  DrawerView,
} from "@react-navigation/drawer";
import { FontAwesome5, SimpleLineIcons } from "@expo/vector-icons";

import Logo from "../../assets/icons/app/Logo.svg";
import React from "react";

export default (props: DrawerContentComponentProps) => {
  const { navigation } = props;

  return (
    <DrawerContentScrollView {...props} scrollEnabled={false}>
      <View
        style={{
          marginHorizontal: 16,
          alignItems: "center",
          flexDirection: "row",
          marginBottom: 8,
          paddingBottom: 12,
          borderBottomWidth: 1,
          //   borderRadius: 8,
          borderBottomColor: "#efefef",
        }}
      >
        <Image
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: "#00bfff",
          }}
          source={{
            uri: "https://lh3.googleusercontent.com/xoSEsxi45bAjWFvxbAWX-Sng4AeEyU7NfA9vJ9k-UpX_1qoP0JrdNI-njQ0K8A1gm1cJqv4j_P-cMZuedCgQ3ik=w600",
          }}
        />

        <Text
          style={{
            fontWeight: "500",
            marginStart: 12,
            fontSize: 17,
            maxWidth: "70%",
          }}
          numberOfLines={1}
        >
          ChainLinkGod.eth
        </Text>
      </View>

      <DrawerItem
        label="Wallet"
        onPress={() => {
          navigation.navigate("Home");
        }}
        labelStyle={{ fontSize: 17, marginStart: -16 }}
        icon={({ color, size }) => (
          <SimpleLineIcons color={color} size={size} name={"wallet"} />
        )}
      />

      <DrawerItem
        label="Settings"
        onPress={() => {}}
        labelStyle={{ fontSize: 17, marginStart: -16 }}
        icon={({ color, size }) => (
          <SimpleLineIcons color={color} size={size} name={"settings"} />
        )}
      />

      <View style={{ height: "100%", backgroundColor: "yellow" }}></View>

      <View style={{ paddingHorizontal: 8 }}>
        <FontAwesome5.Button
          name="ethereum"
          onPress={() => {}}
          size={18}
          iconStyle={{ marginHorizontal: 8 }}
          style={{ justifyContent: "center", alignItems: "center" }}
          borderRadius={5}
        >
          Connect with Ethereum
        </FontAwesome5.Button>
      </View>
    </DrawerContentScrollView>
  );
};
