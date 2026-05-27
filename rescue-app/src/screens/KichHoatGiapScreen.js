import React, { useCallback, useEffect, useRef, useState } from "react";

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
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

const ARMOR_WAKE_PHRASE = "BIẾN HÌNH";

export default function KichHoatGiapScreen() {
  const [isActivated, setIsActivated] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceUnavailable, setVoiceUnavailable] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const restartTimerRef = useRef(null);
  const scheduleRestartRef = useRef(null);
  const isActivatedRef = useRef(false);

  useEffect(() => {
    isActivatedRef.current = isActivated;
  }, [isActivated]);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const activateArmor = useCallback(() => {
    if (isActivatedRef.current || voiceUnavailable) return;

    isActivatedRef.current = true;
    setIsActivated(true);
    clearRestartTimer();
    setIsListening(false);
    stopSpeechSafely();
    router.replace("/KichHoatGiapThanhCong");
  }, [clearRestartTimer, voiceUnavailable]);

  const handleSpeechText = useCallback((text) => {
    if (!text) return;
    setLastTranscript(text);

    if (containsWakePhrase(text)) {
      activateArmor();
    }
  }, [activateArmor]);

  const startListening = useCallback(async () => {
    if (isActivatedRef.current || voiceUnavailable) return;

    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        setIsListening(false);
        setVoiceUnavailable(true);
        return;
      }

      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setIsListening(false);
        setVoiceUnavailable(true);
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: "vi-VN",
        interimResults: true,
        continuous: false,
        contextualStrings: [ARMOR_WAKE_PHRASE],
      });
      setIsListening(true);
    } catch (error) {
      setIsListening(false);
      if (isNativeVoiceUnavailable(error)) {
        setVoiceUnavailable(true);
        return;
      }
      scheduleRestartRef.current?.();
    }
  }, [voiceUnavailable]);

  const scheduleRestart = useCallback(() => {
    if (isActivatedRef.current || voiceUnavailable) return;
    clearRestartTimer();
    restartTimerRef.current = setTimeout(() => {
      startListening();
    }, 500);
  }, [clearRestartTimer, startListening, voiceUnavailable]);

  useEffect(() => {
    scheduleRestartRef.current = scheduleRestart;
  }, [scheduleRestart]);

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    scheduleRestartRef.current?.();
  });

  useSpeechRecognitionEvent("error", (event) => {
    setIsListening(false);
    if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
      setVoiceUnavailable(true);
      return;
    }
    scheduleRestartRef.current?.();
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event?.results?.map((result) => result?.transcript || "").join(" ") || "";
    handleSpeechText(transcript);
  });

  useEffect(() => {
    startListening();

    return () => {
      clearRestartTimer();
      stopSpeechSafely();
    };
  }, [clearRestartTimer, startListening]);

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
      <Image
        source={require("../../assets/images/trangchubgr.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={2}
      />

      <View style={styles.topRow}>
        <View style={styles.versionTag}>
          <Text style={styles.versionText}>
            • ARMOR_SYNC_V1.0
          </Text>
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.push("/BanDoBatDau")}
        >
          <Text style={styles.skipText}>
            SKIP
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.videoWrapper}>
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

        <View style={styles.nodesWrapper}>
          <View style={styles.node}>
            <Text style={styles.nodeLabel}>
              LÕI NĂNG LƯỢNG
            </Text>

            <Text style={styles.nodeValue}>
              SẴN SÀNG
            </Text>

            <View style={styles.nodeGlow} />
          </View>

          <View style={styles.node}>
            <Text style={styles.nodeLabel}>
              KHÓA AN TOÀN
            </Text>

            <Text style={styles.nodeValue}>
              ĐANG KHÓA
            </Text>

            <View style={styles.nodeGlow} />
          </View>

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

      <View style={styles.waveWrapper}>
        <Image
          source={require("../../assets/icons/voice-kichhoat.png")}
          style={styles.waveIcon}
        />
      </View>

      <Text style={styles.bottomLabel}>
        Hô khẩu lệnh để kích hoạt:
      </Text>

      <View style={styles.commandButton}>
        <Text style={styles.commandText}>
          {`"${ARMOR_WAKE_PHRASE}"`}
        </Text>
      </View>

      <Text style={styles.listenStatus}>
        {getListenStatus(isListening, voiceUnavailable)}
      </Text>
      {lastTranscript ? (
        <Text style={styles.transcriptText} numberOfLines={1}>
          {lastTranscript}
        </Text>
      ) : null}
    </SafeAreaView>
  );
}

function stopSpeechSafely() {
  try {
    ExpoSpeechRecognitionModule.abort();
  } catch {
    // Ignore when recognizer is already stopped.
  }
}

function isNativeVoiceUnavailable(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return message.includes("native")
    || message.includes("not available")
    || message.includes("module");
}

function getListenStatus(isListening, voiceUnavailable) {
  if (voiceUnavailable) {
    return "Micro nhận diện cần dev build để hoạt động.";
  }
  return isListening ? "Đang lắng nghe khẩu lệnh..." : "Đang khởi động micro...";
}

function containsWakePhrase(text) {
  return normalizeSpeechText(text).includes(normalizeSpeechText(ARMOR_WAKE_PHRASE));
}

function normalizeSpeechText(text) {
  return String(text || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Đ/g, "D")
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

  listenStatus: {
    marginTop: 10,

    color: "#8B8B8B",

    fontSize: 12,
    fontWeight: "600",
  },

  transcriptText: {
    width: "88%",

    marginTop: 6,

    color: "#313A51",

    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
});
