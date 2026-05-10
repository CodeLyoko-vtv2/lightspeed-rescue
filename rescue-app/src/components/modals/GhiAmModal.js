import React, {
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function GhiAmModal({
  onClose,
}) {
    const [isPaused, setIsPaused] =
  useState(false);
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Ghi âm
          </Text>

          <TouchableOpacity
            onPress={onClose}
          >
            <Text style={styles.close}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        {/* WAVE */}
        <View style={styles.waveWrapper}>
          {/* LEFT */}
          <View style={styles.waveLeft}>
            {[
              14, 8, 18, 9, 13, 16, 7, 12, 18,
              10, 15, 8, 13, 16, 9, 12, 14,
              10, 16, 9, 13, 11,
            ].map((height, index) => (
              <View
                key={index}
                style={[
                  styles.orangeBar,
                  { height },
                ]}
              />
            ))}
          </View>

          {/* CENTER */}
          <View style={styles.centerLine} />

          {/* RIGHT */}
          <View style={styles.waveRight}>
            {Array.from({ length: 18 }).map(
              (_, index) => (
                <View
                  key={index}
                  style={styles.grayDot}
                />
              )
            )}
          </View>
        </View>

        {/* BOTTOM */}
        <View style={styles.bottomRow}>
          <Text style={styles.timer}>
            00:10:04
          </Text>

          <View style={styles.actions}>
            {/* Pause */}
            <TouchableOpacity
  style={styles.pauseButton}
  onPress={() =>
    setIsPaused(!isPaused)
  }
>
  <Text style={styles.pauseText}>
    {isPaused
      ? "▶ Play"
      : "❚❚ Pause"}
  </Text>
</TouchableOpacity>

            {/* Replay */}
            <TouchableOpacity
              style={styles.replayButton}
            >
              <Text style={styles.replayText}>
                ↻ Replay
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",

    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(0,0,0,0.15)",
  },

  container: {
    width: "84%",

    backgroundColor: "#ECEFF7",

    borderRadius: 30,

    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 20,
  },

  title: {
    color: "#FF8852",

    fontSize: 16,
    fontWeight: "500",
  },

  close: {
    fontSize: 26,
    color: "#000",
  },

  waveWrapper: {
    height: 84,

    borderRadius: 999,

    backgroundColor: "#F9FAFF",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 18,

    marginBottom: 24,
  },

  waveLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  orangeBar: {
    width: 2,

    borderRadius: 999,

    backgroundColor: "#FF8852",

    marginRight: 3,
  },

  centerLine: {
    width: 2,
    height: 56,

    backgroundColor: "#FF8852",

    marginHorizontal: 8,
  },

  waveRight: {
    flexDirection: "row",
    alignItems: "center",

    flexWrap: "wrap",

    width: 92,
  },

  grayDot: {
    width: 3,
    height: 3,

    borderRadius: 999,

    backgroundColor: "#777",

    marginRight: 4,
    marginBottom: 4,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  timer: {
    color: "#313A51",

    fontSize: 18,
    fontWeight: "500",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
  },

  pauseButton: {
    height: 28,

    borderRadius: 999,

    backgroundColor: "#D9DDE9",

    paddingHorizontal: 10,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  pauseText: {
    color: "#1E1E1E",

    fontSize: 10,
    fontWeight: "500",
  },

  replayButton: {
    height: 28,

    borderRadius: 999,

    backgroundColor: "#FF8852",

    paddingHorizontal: 10,

    alignItems: "center",
    justifyContent: "center",
  },

  replayText: {
    color: "#FFF",

    fontSize: 10,
    fontWeight: "500",
  },
});