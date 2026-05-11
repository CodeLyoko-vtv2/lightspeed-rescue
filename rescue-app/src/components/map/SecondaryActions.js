import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

export default function SecondaryActions() {
  return (
    <View style={styles.container}>
      <TouchableOpacity>
        <Image
          source={require("../../../assets/icons/Round-1.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondButton}>
        <Image
          source={require("../../../assets/icons/Round-2.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    top: 160,
  },

  secondButton: {
    marginTop: 12,
  },

  icon: {
    width: 52,
    height: 52,
  },
});