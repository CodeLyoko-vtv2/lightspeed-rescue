import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";

export default function FilterPills() {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {/* Quân đội */}
        <TouchableOpacity style={styles.pill}>
          <Image
            source={require("../../../assets/icons/Army.png")}
            style={styles.icon}
            resizeMode="contain"
          />

          <Text style={styles.text}>
            Quân đội
          </Text>
        </TouchableOpacity>

        {/* Công an */}
        <TouchableOpacity style={styles.pill}>
          <Image
            source={require("../../../assets/icons/Police.png")}
            style={styles.icon}
            resizeMode="contain"
          />

          <Text style={styles.text}>
            Công an
          </Text>
        </TouchableOpacity>

        {/* Cứu hỏa */}
        <TouchableOpacity style={styles.pill}>
          <Image
            source={require("../../../assets/icons/Fire.png")}
            style={styles.icon}
            resizeMode="contain"
          />

          <Text style={styles.text}>
            Cứu hỏa
          </Text>
        </TouchableOpacity>

        {/* Bệnh viện */}
        <TouchableOpacity style={styles.pill}>
          <Image
            source={require("../../../assets/icons/Hospital.png")}
            style={styles.icon}
            resizeMode="contain"
          />

          <Text style={styles.text}>
            Bệnh viện
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 122,
    left: 0,
    right: 0,

    paddingLeft: 12,
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFF",

    paddingVertical: 7,
    paddingHorizontal: 12,

    borderRadius: 30,

    marginRight: 8,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },

  icon: {
    width: 22,
    height: 22,
    marginRight: 6,
  },

  text: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(0,0,0,0.9)",
    letterSpacing: 0.2,
  },
});