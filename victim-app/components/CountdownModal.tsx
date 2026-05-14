import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { styles } from '../constants/(tabs)/home.styles';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSend: () => void;
  seconds: number;
  incidentName: string; // Vẫn giữ prop này để không bị lỗi ở file home.tsx
}

// ✅ DANH SÁCH TỪ KHÓA KÊU CỨU THỰC TẾ
const SOS_KEYWORDS = [
  "CỨU VỚI", 
  "CHÁY RỒI", 
  "CÓ TRỘM", 
  "GIÚP TÔI VỚI", 
  "CỨU MẠNG",
  "ỐI LÀNG NƯỚC ƠI"
];

export const CountdownModal = ({ visible, onClose, onSend, seconds, incidentName }: Props) => {
  const [detectedWord, setDetectedWord] = useState("");

  // ✅ CHỈ RANDOM 1 LẦN KHI MODAL MỞ LÊN (Tránh bị nhảy chữ mỗi giây khi đếm ngược)
  useEffect(() => {
    if (visible) {
      const randomWord = SOS_KEYWORDS[Math.floor(Math.random() * SOS_KEYWORDS.length)];
      setDetectedWord(randomWord);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBottomOverlay}>
        <View style={[styles.modalBottomSheetFull]}>
          <View style={styles.modalHandle} />
          
          <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
            <Ionicons name="close-circle" size={36} color="#FF8852" />
          </TouchableOpacity>
          
          <Text style={styles.modalTitle}>PHÁT HIỆN TIẾNG KÊU CỨU</Text>
          
          {/* ✅ THAY BẰNG TỪ KHÓA THỰC TẾ */}
          <Text style={styles.modalSubTitle}>
            Có phải bạn vừa kêu "{detectedWord}" không?
          </Text>
          
          <View style={styles.countdownCircleLarge}>
            <Text style={styles.countdownNumberLarge}>{seconds}</Text>
            <Text style={styles.countdownUnitLarge}>GIÂY</Text>
          </View>
          
          <TouchableOpacity style={[styles.sendNowButton, { marginBottom: 30 }]} onPress={onSend}>
            <Text style={[styles.sendNowButtonText]}>GỬI NGAY</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};