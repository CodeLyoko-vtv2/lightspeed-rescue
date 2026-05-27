import React from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { openVictimDirectionsForRescuer } from "../utils/googleMapsNavigation";

export default function KichHoatThanhCongScreen() {
  const handleOpenDirections = async () => {
    const rescuerId = await AsyncStorage.getItem("rescuerUid");
    openVictimDirectionsForRescuer(rescuerId);
  };
  const player = useVideoPlayer(
    require("../../assets/images/Kich hoat thanh cong.mp4"),
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

      {/* SUCCESS TAG */}
      <View style={styles.successTag}>
        <Text style={styles.successText}>
          • KÍCH HOẠT THÀNH CÔNG
        </Text>
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
              NĂNG LƯỢNG
            </Text>

            <Text style={styles.nodeValue}>
              100%
            </Text>

            <View style={styles.nodeGlow} />
          </View>

          {/* NODE */}
          <View style={styles.node}>
            <Text style={styles.nodeLabel}>
              ĐỘ BỀN GIÁP
            </Text>

            <Text style={styles.nodeValue}>
              100%
            </Text>

            <View style={styles.nodeGlow} />
          </View>

          {/* NODE */}
          <View style={styles.node}>
            <Text style={styles.nodeLabel}>
              KẾT NỐI
            </Text>

            <Text style={styles.nodeValue}>
              ỔN ĐỊNH
            </Text>

            <View style={styles.nodeGlow} />
          </View>
        </View>
      </View>

      {/* READY STATUS */}
      <View style={styles.readyWrapper}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkText}>✓</Text>
        </View>

        <View>
          <Text style={styles.readyTitle}>
            HỆ THỐNG SẴN SÀNG
          </Text>

          <Text style={styles.readySubtitle}>
            Đồng bộ sinh trắc học hoàn tất.
          </Text>
        </View>
      </View>

      {/* BUTTON */}
      <TouchableOpacity style={styles.launchButton} onPress={handleOpenDirections}>
        <Text style={styles.launchText}>
          CHỈ ĐƯỜNG
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

  successTag: {
    marginTop: 70,

    height: 34,

    borderRadius: 999,

    borderWidth: 1,
    borderColor: "#A6E6B1",

    backgroundColor: "#F2FFF4",

    paddingHorizontal: 18,

    justifyContent: "center",
    alignItems: "center",
  },

  successText: {
    color: "#32C45A",

    fontSize: 11,
    fontWeight: "800",

    letterSpacing: 0.4,
  },

  videoWrapper: {
    width: "88%",

    marginTop: 24,

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
    top: 175,
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

  readyWrapper: {
    width: "88%",

    flexDirection: "row",
    alignItems: "center",

    marginTop: 22,
  },

  checkCircle: {
    width: 36,
    height: 36,

    borderRadius: 999,

    backgroundColor: "#FF6D3A",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  checkText: {
    color: "#FFF",

    fontSize: 20,
    fontWeight: "800",
  },

  readyTitle: {
    color: "#313A51",

    fontSize: 18,
    fontWeight: "800",

    marginBottom: 2,
  },

  readySubtitle: {
    color: "#8E8E8E",

    fontSize: 12,
    fontWeight: "500",
  },

  launchButton: {
    width: "88%",
    height: 68,

    borderRadius: 18,

    marginTop: 22,

    backgroundColor: "#FF7A1A",

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#FF7A1A",
    shadowOpacity: 0.25,
    shadowRadius: 12,

    elevation: 8,
  },

  launchText: {
    color: "#FFF",

    fontSize: 24,
    fontWeight: "900",

    letterSpacing: 0.6,
  },
});
