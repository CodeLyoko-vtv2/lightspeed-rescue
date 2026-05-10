import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants/colors";

const { width } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (uri: string) => void;
  existingAudioUri: string | null;
  onDelete: () => void;
}

export const AudioRecordModal = ({
  visible,
  onClose,
  onSave,
  existingAudioUri,
  onDelete,
}: Props) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [durationMillis, setDurationMillis] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      setAudioUri(existingAudioUri);
      setDurationMillis(0);
      setIsPlaying(false);
    }
  }, [visible, existingAudioUri]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording && startTime) {
      interval = setInterval(() => {
        const currentDuration = Date.now() - startTime;
        setDurationMillis(currentDuration);
        if (currentDuration >= 60000) stopRecording();
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRecording, startTime]);

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((millis % 1000) / 10);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${centiseconds.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(recording);
      setIsRecording(true);
      setAudioUri(null);
      setStartTime(Date.now());
    } catch (err) {
      console.error("Lỗi khi bắt đầu ghi âm", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    const uri = recording.getURI();
    setAudioUri(uri);
    setRecording(null);
  };

  const playAudio = async () => {
    if (!audioUri) return;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      setSound(sound);
      setIsPlaying(true);
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded) {
          setDurationMillis(status.positionMillis);
          if (status.didJustFinish) setIsPlaying(false);
        }
      });
    } catch (err) {
      console.error("Lỗi phát âm thanh", err);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const handleSave = () => {
    if (audioUri) {
      onSave(audioUri);
      onClose();
    }
  };

  const handleDelete = () => {
    setAudioUri(null);
    setDurationMillis(0);
    onDelete();
    if (!isRecording) onClose();
  };

  const renderWaveform = () => {
    const bars = [
      10, 15, 8, 20, 25, 18, 12, 22, 28, 15, 10, 20, 15, 25, 18, 10, 5, 5, 5, 5,
      5, 5, 5, 5, 5,
    ];
    return (
      <View style={localStyles.waveformContainer}>
        {bars.map((h, i) => (
          <View
            key={i}
            style={[
              localStyles.bar,
              { height: h, backgroundColor: i < 15 ? COLORS.primary : "#CCC" },
            ]}
          />
        ))}
        <View style={localStyles.playhead}>
          <View style={localStyles.playheadDot} />
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={localStyles.overlay}>
        <View style={localStyles.modalContent}>
          <View style={localStyles.header}>
            <Text style={localStyles.titleText}>Ghi âm</Text>
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-bin" size={28} color="#2D3142" />
            </TouchableOpacity>
          </View>

          <View style={localStyles.waveArea}>{renderWaveform()}</View>

          <View style={localStyles.bottomControls}>
            <View style={localStyles.timerContainer}>
              <Text style={localStyles.timerText}>
                {formatTime(durationMillis)}
              </Text>
            </View>

            <View style={localStyles.btnRow}>
              {!audioUri ? (
                <TouchableOpacity
                  style={[
                    localStyles.actionBtn,
                    { backgroundColor: isRecording ? "#FFE0D3" : "#E5E7EB" },
                  ]}
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <Ionicons
                    name={isRecording ? "square" : "mic"}
                    size={16}
                    color={isRecording ? COLORS.primary : "#000"}
                  />
                  <Text
                    style={[
                      localStyles.actionText,
                      { color: isRecording ? COLORS.primary : "#000" },
                    ]}
                  >
                    {isRecording ? "Đang thu" : "Thu âm"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[localStyles.actionBtn, { backgroundColor: "#E5E7EB" }]}
                  onPress={isPlaying ? stopAudio : playAudio}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={16}
                    color="#000"
                  />
                  <Text style={[localStyles.actionText, { color: "#000" }]}>
                    {isPlaying ? "Dừng" : "Play"}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[localStyles.actionBtn, { backgroundColor: COLORS.primary }]}
                onPress={audioUri ? handleSave : stopRecording}
                disabled={!audioUri && !isRecording}
              >
                <Ionicons
                  name={audioUri ? "checkmark" : "square"}
                  size={16}
                  color="#FFF"
                />
                <Text style={[localStyles.actionText, { color: "#FFF" }]}>
                  {audioUri ? "Lưu" : "Stop"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: "#F4F5F9",
    borderRadius: 25,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titleText: { fontSize: 20, color: COLORS.primary, fontWeight: "bold" },
  waveArea: {
    height: 100,
    backgroundColor: "#FFF",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    position: "relative",
  },
  bar: { width: 3, borderRadius: 2 },
  playhead: {
    position: "absolute",
    left: "50%",
    height: 60,
    width: 2,
    backgroundColor: COLORS.primary,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  playheadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    top: -4,
  },
  
  // ✅ ĐÃ FIX LẠI TOÀN BỘ KHU VỰC ĐIỀU KHIỂN DƯỚI
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  timerContainer: {
    width: 100, // Đủ để ôm khít 00:00:00, không dư lấn sang phải
  },
  timerText: { 
    fontSize: 24, // Hạ size một xíu để thoáng mắt
    fontWeight: "500", 
    color: "#2D3142", 
    fontVariant: ['tabular-nums'] 
  },
  btnRow: { 
    flexDirection: "row", 
    gap: 6, // Thu hẹp khoảng cách giữa 2 nút
    flex: 1, // Ép flex để nó tự rúc vào góc phải
    justifyContent: "flex-end" 
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12, // Gọt bớt lề thừa trong nút
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
  },
  actionText: { 
    fontSize: 13, // Giảm 1 tí xíu cho cân đối 
    fontWeight: "bold" 
  },
});