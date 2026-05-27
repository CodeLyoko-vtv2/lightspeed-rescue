import React from "react";

import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from "react-native";

import {
  useNavigation,
  useRoute,
} from "@react-navigation/native";

export default function ImageViewerScreen() {
  const navigation = useNavigation();

  const route = useRoute();

const { image, imageUrl } = route.params || {};

const images = {
  fire1: require("../../assets/images/fire-1.png"),

  fire2: require("../../assets/images/fire-2.png"),

  fire3: require("../../assets/images/fire-3.png"),

  fire4: require("../../assets/images/fire-4.png"),
};
  const source = imageUrl ? { uri: imageUrl } : images[image];

  return (
    <SafeAreaView style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
        >
          <Text style={styles.back}>
            ←
          </Text>
        </TouchableOpacity>

        <Text style={styles.fileName}>
          20260510_143522.jpg
        </Text>

        <Text style={styles.menu}>
          ⋮
        </Text>
      </View>

      {/* IMAGE */}
      {source ? (
        <Image
          source={source}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  topBar: {
    height: 56,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,

    backgroundColor: "#111",
  },

  back: {
    color: "#FFF",

    fontSize: 24,

    marginRight: 14,
  },

  fileName: {
    flex: 1,

    color: "#FFF",

    fontSize: 14,
  },

  menu: {
    color: "#FFF",

    fontSize: 22,
  },

  image: {
    width: "100%",
    height: "100%",
  },
});