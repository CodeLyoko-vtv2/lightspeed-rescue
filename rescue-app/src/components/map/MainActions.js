import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

export default function MainActions() {
  return (
    <View style={styles.container}>
      <TouchableOpacity>
  <Image
    source={require("../../../assets/icons/Round-3.png")}
    style={styles.iconTop}
    resizeMode="contain"
  />
</TouchableOpacity>

<TouchableOpacity style={styles.secondButton}>
  <Image
    source={require("../../../assets/icons/Round-4.png")}
    style={styles.iconBottom}
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
    bottom: 150,
  },

  secondButton: {
    marginTop: 12,
  },

  icon: {
    width: 60,
    height: 60,
  },
  iconTop: {
  width: 60,
  height: 60,
},

iconBottom: {
  width: 77,
  height: 77,

  marginLeft: -9,
},
});