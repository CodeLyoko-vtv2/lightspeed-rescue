import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

export default function SearchBar({ onPress  }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
  style={styles.searchBar}
  activeOpacity={0.9}
  onPress={onPress}
>
        {/* Left */}
        <View style={styles.leftSection}>
          <Image
            source={require("../../../assets/icons/logo.png")}
            style={styles.locationIcon}
            resizeMode="contain"
          />

          <Text style={styles.searchText}>
            Tìm kiếm ở đây
          </Text>
        </View>

        {/* Right */}
        <View style={styles.rightSection}>
          <TouchableOpacity>
            <Image
              source={require("../../../assets/icons/MicIcon.png")}
              style={styles.micIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity>
            <Image
              source={require("../../../assets/icons/UserIcon.png")}
              style={styles.userIcon}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
  },

  searchBar: {
    height: 54,
    backgroundColor: "#FFF",
    borderRadius: 40,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 14,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  locationIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
  },

  searchText: {
    fontSize: 16,
    color: "#707070",
  },

  micIcon: {
    width: 22,
    height: 22,
    marginRight: 14,
  },

  userIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
});