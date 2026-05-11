import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

export default function SearchResultItem({
  title,
  address,
  status,onPress,
}) {
  return (
    <TouchableOpacity
  style={styles.container}
  activeOpacity={0.8}
  onPress={onPress}
>
      <View style={styles.iconBox}>
        <Image
          source={require("../../../assets/icons/History.png")}
          style={styles.icon}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <Text style={styles.address} numberOfLines={1}>
          {address}
        </Text>

        <Text
          style={[
            styles.status,
            status?.includes("Mở")
              ? styles.open
              : styles.close,
          ]}
          numberOfLines={1}
        >
          {status}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",

    paddingLeft: 12,
    backgroundColor: "#FFF",
  },

  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 20,

    backgroundColor: "#F0F0F0",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 18,
  },

  icon: {
    width: 20,
    height: 20,
  },

  content: {
    flex: 1,

    paddingVertical: 18,

    borderBottomWidth: 1,
    borderBottomColor: "#F3F2F2",
  },

  title: {
    fontSize: 14,
    color: "#404040",
    marginBottom: 3,
  },

  address: {
    fontSize: 12,
    color: "#867F7F",
    marginBottom: 3,
  },

  status: {
    fontSize: 12,
  },

  open: {
    color: "#4CAF50",
  },

  close: {
    color: "#867F7F",
  },
});