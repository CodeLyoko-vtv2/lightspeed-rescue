import React, {
  useEffect,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";

import {
  useRouter,
} from "expo-router";

export default function GioiThieuScreen() {

  const router = useRouter();

  useEffect(() => {

    const timer =
      setTimeout(() => {

        router.replace("/DangNhap");

      }, 3000);

    return () =>
      clearTimeout(timer);

  }, []);

  return (
    <SafeAreaView style={styles.container}>

      {/* MAIN */}
      <TouchableOpacity
        activeOpacity={0.95}
        style={styles.card}
        onPress={() =>
          router.replace("/x")
        }
      >
        {/* LOGO */}
        <Image
          source={require("../../assets/images/Group 483517.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* TITLE */}
        <Text style={styles.title}>
          Lightspeed Rescue
        </Text>

        {/* SUBTITLE */}
        <Text style={styles.subtitle}>
          "Tốc độ ánh sáng! Giải cứu!"
        </Text>
      </TouchableOpacity>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#FFF",

    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 150,
    height: 150,

    marginBottom: 22,
  },

  title: {
    fontSize: 32,
    fontWeight: "600",

    color: "#FF8852",

    marginTop: 6,
  },

  subtitle: {
    fontSize: 18,

    color: "#8B8B8B",

    marginTop: 10,

    textAlign: "center",
  },

  bottomBar: {
    position: "absolute",

    bottom: 20,

    width: 135,
    height: 5,

    borderRadius: 999,

    backgroundColor: "#313A51",
  },
});