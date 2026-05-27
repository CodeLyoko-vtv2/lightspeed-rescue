import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import PropTypes from "prop-types";

export default function MainActions({ directionsEnabled, onDirections }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={directionsEnabled ? 0.7 : 1}
        onPress={directionsEnabled ? onDirections : undefined}
        style={!directionsEnabled && styles.disabledButton}
      >
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

MainActions.propTypes = {
  directionsEnabled: PropTypes.bool,
  onDirections: PropTypes.func,
};

MainActions.defaultProps = {
  directionsEnabled: false,
  onDirections: undefined,
};

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
disabledButton: {
  opacity: 0.45,
},
});
