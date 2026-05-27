import React, {
  useEffect,
  useState,
} from "react";
import { Audio } from "expo-av";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function GhiAmModal({
  onClose,
  audioUrl,
}) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [durationMillis, setDurationMillis] = useState(0);
  const [positionMillis, setPositionMillis] = useState(0);

  useEffect(() => {
    let mounted = true;
    let loadedSound = null;

    const loadAudio = async () => {
      setSound(null);
      setIsPlaying(false);
      setDurationMillis(0);
      setPositionMillis(0);

      if (!audioUrl) return;

      try {
        setIsLoading(true);
        const { sound: nextSound, status } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: false },
        );
        loadedSound = nextSound;

        nextSound.setOnPlaybackStatusUpdate((nextStatus) => {
          if (!nextStatus.isLoaded) return;
          setDurationMillis(nextStatus.durationMillis || 0);
          setPositionMillis(nextStatus.positionMillis || 0);
          setIsPlaying(Boolean(nextStatus.isPlaying));
          if (nextStatus.didJustFinish) {
            setIsPlaying(false);
            setPositionMillis(nextStatus.durationMillis || 0);
          }
        });

        if (!mounted) {
          await nextSound.unloadAsync();
          return;
        }

        setSound(nextSound);
        setDurationMillis(status?.durationMillis || 0);
      } catch (error) {
        console.error("Lỗi tải ghi âm:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadAudio();

    return () => {
      mounted = false;
      if (loadedSound) loadedSound.unloadAsync();
    };
  }, [audioUrl]);

  const togglePlay = async () => {
    if (!sound || isLoading) return;
    try {
      setIsLoading(true);
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.didJustFinish) {
          await sound.setPositionAsync(0);
        }
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Lỗi phát ghi âm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const replayAudio = async () => {
    if (!sound || isLoading) return;
    try {
      setIsLoading(true);
      await sound.setPositionAsync(0);
      await sound.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error("Lỗi phát lại ghi âm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
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

        <View style={styles.waveWrapper}>
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

          <View style={styles.centerLine} />

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

        <View style={styles.bottomRow}>
          <Text style={styles.timer}>
            {audioUrl ? `${formatMillis(positionMillis)} / ${formatMillis(durationMillis)}` : "Chưa có ghi âm"}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.pauseButton,
                (!audioUrl || isLoading) && styles.disabledButton,
              ]}
              onPress={togglePlay}
              disabled={!audioUrl || isLoading}
            >
              <Text style={styles.pauseText}>
                {isPlaying ? "Pause" : "▶ Play"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.replayButton,
                (!audioUrl || isLoading) && styles.disabledButton,
              ]}
              onPress={replayAudio}
              disabled={!audioUrl || isLoading}
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

function formatMillis(value) {
  const totalSeconds = Math.max(0, Math.floor((value || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
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

  disabledButton: {
    opacity: 0.45,
  },
});
