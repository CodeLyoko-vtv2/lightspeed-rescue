import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import {
  useRouter,
} from "expo-router";
export default function BottomNavbarBDTK() {
  const router = useRouter();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Đường đi */}
      <TouchableOpacity
  style={styles.activeButton}
  onPress={() =>
    router.push(
      "/BanDoDuongDi"
    )
  }
>
        <Image
          source={require("../../../assets/icons/Searched-Icon-1.png")}
          style={styles.icon}
        />

        <Text style={styles.activeText}>
          Đường đi
        </Text>
      </TouchableOpacity>

      {/* Bắt đầu */}
      <TouchableOpacity style={styles.button}>
        <Image
          source={require("../../../assets/icons/Searched-Icon-2.png")}
          style={styles.icon}
        />

        <Text style={styles.text}>
          Bắt đầu
        </Text>
      </TouchableOpacity>

      {/* Gọi */}
      <TouchableOpacity style={styles.button}>
        <Image
          source={require("../../../assets/icons/Searched-Icon-3.png")}
          style={styles.icon}
        />

        <Text style={styles.text}>
          Gọi
        </Text>
      </TouchableOpacity>

      {/* Lưu */}
      <TouchableOpacity style={styles.button}>
        <Image
          source={require("../../../assets/icons/Searched-Icon-4.png")}
          style={styles.icon}
        />

        <Text style={styles.text}>
          Lưu
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",

    paddingRight: 20,

    marginTop: 1,
    marginBottom: 1,
  },

  activeButton: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FF8852",

    paddingHorizontal: 18,
    paddingVertical: 12,

    borderRadius: 30,

    marginRight: 12,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#ECF3FE",

    paddingHorizontal: 18,
    paddingVertical: 12,

    borderRadius: 30,

    marginRight: 12,
  },

  icon: {
    width: 18,
    height: 18,

    marginRight: 6,
  },

  activeText: {
    color: "#FFF",

    fontSize: 15,
    fontWeight: "600",
  },

  text: {
    color: "#FF8852",

    fontSize: 15,
    fontWeight: "600",
  },
});