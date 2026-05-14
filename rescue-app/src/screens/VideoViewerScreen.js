import React from "react";

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter }
from "expo-router";

export default function VideoViewerScreen() {
const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() =>
  router.back()
}
        >
          <Text style={styles.back}>
            ←
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          video-bao-cao-hien-tru...
        </Text>

        <Text style={styles.menu}>
          ⋮
        </Text>
      </View>

      {/* VIDEO */}
      <View style={styles.videoWrapper}>
        <Image
          source={require("../../assets/images/fire-2.png")}
          style={styles.video}
          resizeMode="cover"
        />

        {/* CONTROLS */}
        <View
          style={styles.centerControls}
        >
          <TouchableOpacity
            style={
              styles.smallControl
            }
          >
            <Text
              style={
                styles.controlIcon
              }
            >
              ↺
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playBtn}
          >
            <Text
              style={styles.playIcon}
            >
              ▶
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.smallControl
            }
          >
            <Text
              style={
                styles.controlIcon
              }
            >
              ↻
            </Text>
          </TouchableOpacity>
        </View>

        {/* BOTTOM CONTROLS */}
        <View
          style={styles.bottomControls}
        >
          <Text style={styles.ctrl}>
            CC
          </Text>

          <Text style={styles.ctrl}>
            1x
          </Text>

          <Text style={styles.ctrl}>
            ⚙
          </Text>

          <Text style={styles.ctrl}>
            ⛶
          </Text>
        </View>

        {/* TIMELINE */}
        <View style={styles.timeline}>
          <Text style={styles.time}>
            0:04 / 3:57
          </Text>

          <View
            style={styles.line}
          >
            <View
              style={styles.progress}
            />

            <View
              style={styles.dot}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  topBar: {
    height: 52,

    backgroundColor: "#111",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,
  },

  back: {
    color: "#FFF",

    fontSize: 22,

    marginRight: 14,
  },

  title: {
    flex: 1,

    color: "#FFF",

    fontSize: 14,
  },

  menu: {
    color: "#FFF",

    fontSize: 22,
  },

  videoWrapper: {
    flex: 1,

    position: "relative",
  },

  video: {
    width: "100%",
    height: "100%",
  },

  centerControls: {
    position: "absolute",

    top: "40%",
    left: 0,
    right: 0,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  smallControl: {
    width: 44,
    height: 44,

    borderRadius: 14,

    backgroundColor:
      "rgba(0,0,0,0.65)",

    alignItems: "center",
    justifyContent: "center",
  },

  controlIcon: {
    color: "#FFF",

    fontSize: 20,
  },

  playBtn: {
    width: 84,
    height: 52,

    borderRadius: 26,

    backgroundColor: "#FFF",

    marginHorizontal: 14,

    alignItems: "center",
    justifyContent: "center",
  },

  playIcon: {
    color: "#000",

    fontSize: 24,
  },

  bottomControls: {
    position: "absolute",

    bottom: 95,
    left: 12,
    right: 12,

    height: 54,

    borderRadius: 22,

    backgroundColor:
      "rgba(10,10,15,0.92)",

    flexDirection: "row",
    justifyContent:
      "space-around",
    alignItems: "center",
  },

  ctrl: {
    color: "#FFF",

    fontSize: 16,
  },

  timeline: {
    position: "absolute",

    left: 14,
    right: 14,
    bottom: 34,
  },

  time: {
    color: "#FFF",

    fontSize: 12,

    marginBottom: 10,
  },

  line: {
    height: 2,

    backgroundColor:
      "rgba(255,255,255,0.4)",
  },

  progress: {
    width: "12%",
    height: "100%",

    backgroundColor: "#FFF",
  },

  dot: {
    position: "absolute",

    left: "12%",
    top: -5,

    width: 12,
    height: 12,

    borderRadius: 999,

    backgroundColor: "#FFF",
  },
});