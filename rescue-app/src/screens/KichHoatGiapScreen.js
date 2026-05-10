import React, { useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";

import { router } from "expo-router";

import { VideoView, useVideoPlayer } from "expo-video";

export default function KichHoatGiapScreen() {

  // AUTO CHUYỂN SCREEN SAU 3 GIÂY
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/KichHoatGiapThanhCong"); // đổi path tại đây
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const player = useVideoPlayer(
    require("../../assets/images/Bat dau kich hoat.mp4"),
    (player) => {
      player.loop = true;

      player.showNowPlayingNotification = false;

      player.play();
    }
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* BACKGROUND */}
      <Image
        source={require("../../assets/images/trangchubgr.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={2}
      />

      {/* TOP */}
      <View style={styles.topRow}>
        <View style={styles.versionTag}>
          <Text style={styles.versionText}>
            • ARMOR_SYNC_V1.0
          </Text>
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.push("/trangchu")}
        >
          <Text style={styles.skipText}>
            SKIP
          </Text>
        </TouchableOpacity>
      </View>

      {/* VIDEO SECTION */}
      <View style={styles.videoWrapper}>
        {/* VIDEO */}
        <View style={styles.videoContainer}>
          <View style={styles.videoMask}>
            <VideoView
              player={player}
              style={styles.video}
              contentFit="cover"
              nativeControls={false}
              allowsFullscreen={false}
              allowsPictureInPicture={false}
            />
          </View>
        </View>

        {/* STATUS NODES */}
        <View style={styles.nodesWrapper}>
          {/* NODE */}
          <View style={styles.node}>
            <Text style={styles.nodeLabel}>
              LÕI NĂNG LƯỢNG
            </Text>

            <Text style={styles.nodeValue}>
              SẴN SÀNG
            </Text>

            <View style={styles.nodeGlow} />
          </View>

          {/* NODE */}
          <View style={styles.node}>
            <Text style={styles.nodeLabel}>
              KHÓA AN TOÀN
            </Text>

            <Text style={styles.nodeValue}>
              ĐANG KHÓA
            </Text>

            <View style={styles.nodeGlow} />
          </View>

          {/* NODE */}
          <View style={styles.node}>
            <Text style={styles.nodeLabel}>
              SINH TRẮC HỌC
            </Text>

            <Text style={styles.nodeValue}>
              ĐANG QUÉT
            </Text>

            <View style={styles.nodeGlow} />
          </View>
        </View>
      </View>

      {/* VOICE ICON */}
      <View style={styles.waveWrapper}>
        <Image
          source={require("../../assets/icons/voice-kichhoat.png")}
          style={styles.waveIcon}
        />
      </View>

      {/* LABEL */}
      <Text style={styles.bottomLabel}>
        Hô khẩu lệnh để kích hoạt:
      </Text>

      {/* COMMAND */}
      <TouchableOpacity style={styles.commandButton}>
        <Text style={styles.commandText}>
          "EMERGENCY DEKARANGER"
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",

    alignItems: "center",
  },

  backgroundImage: {
    position: "absolute",

    width: "118%",
    height: "118%",

    opacity: 0.22,

    transform: [{ scale: 1.08 }],
  },

  topRow: {
    width: "88%",

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginTop: 55,
    marginBottom: 24,
  },

  versionTag: {
    height: 28,

    borderRadius: 999,

    borderWidth: 1,
    borderColor: "#FFB59C",

    backgroundColor: "#FFF4EF",

    paddingHorizontal: 12,

    justifyContent: "center",
  },

  versionText: {
    color: "#FF6D3A",

    fontSize: 11,
    fontWeight: "700",
  },

  skipButton: {
    width: 62,
    height: 32,

    borderRadius: 10,

    backgroundColor: "#ECECEC",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#D8D8D8",
  },

  skipText: {
    color: "#8B8B8B",

    fontSize: 12,
    fontWeight: "800",

    letterSpacing: 0.4,
  },

  videoWrapper: {
    width: "88%",
    height: 520,

    position: "relative",
  },

  videoContainer: {
    width: "100%",
    height: 500,

    borderRadius: 32,

    borderWidth: 2,
    borderColor: "#FF6D3A",

    backgroundColor: "#000",

    overflow: "hidden",
  },

  videoMask: {
    flex: 1,

    overflow: "hidden",

    borderRadius: 30,
  },

  video: {
    width: "100%",
    height: "112%",

    transform: [{ translateY: -12 }],
  },

  nodesWrapper: {
    position: "absolute",

    right: -2,
    top: 170,
  },

  node: {
    width: 122,
    height: 60,

    backgroundColor: "#262626",

    borderRadius: 20,

    paddingTop: 12,
    paddingHorizontal: 14,

    marginBottom: 12,

    position: "relative",

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,

    elevation: 8,

    justifyContent: "flex-start",
  },

  nodeGlow: {
    position: "absolute",

    left: 10,
    right: 10,
    bottom: 0,

    height: 3,

    borderRadius: 999,

    backgroundColor: "#FF5A2F",
  },

  nodeLabel: {
    color: "#A8A8A8",

    fontSize: 8,
    fontWeight: "600",

    letterSpacing: 0.4,

    marginBottom: 4,

    lineHeight: 10,
  },

  nodeValue: {
    color: "#FFF",

    fontSize: 13,
    fontWeight: "800",

    lineHeight: 17,

    letterSpacing: 0.1,
  },

  waveWrapper: {
    marginTop: 12,
    marginBottom: 18,
  },

  waveIcon: {
    width: 40,
    height: 40,

    resizeMode: "contain",
  },

  bottomLabel: {
    color: "#A4A4A4",

    fontSize: 14,
    fontWeight: "500",

    marginBottom: 18,
  },

  commandButton: {
    width: "88%",
    height: 60,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: "#FFC2AF",

    backgroundColor: "#FFF4EF",

    alignItems: "center",
    justifyContent: "center",
  },

  commandText: {
    color: "#FF6D3A",

    fontSize: 22,
    fontWeight: "800",
  },
});