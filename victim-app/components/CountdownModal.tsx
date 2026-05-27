import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../constants/(tabs)/home.styles";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSend: () => void;
  seconds: number;
  incidentName: string;
}

export const CountdownModal = ({
  visible,
  onClose,
  onSend,
  seconds,
  incidentName,
}: Props) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBottomOverlay}>
        <View style={styles.modalBottomSheetFull}>
          <View style={styles.modalHandle} />

          <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
            <Ionicons name="close-circle" size={36} color="#FF8852" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>PHÁT HIỆN TIẾNG KÊU CỨU</Text>

          <Text style={styles.modalSubTitle}>
            Hệ thống phát hiện {incidentName || "âm thanh nguy hiểm"}. SOS sẽ
            được gửi tự động.
          </Text>

          <View style={styles.countdownCircleLarge}>
            <Text style={styles.countdownNumberLarge}>{seconds}</Text>
            <Text style={styles.countdownUnitLarge}>GIÂY</Text>
          </View>

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 30 }}>
            <TouchableOpacity
              style={[
                styles.sendNowButton,
                {
                  flex: 1,
                  backgroundColor: "#E5E7EB",
                  shadowOpacity: 0,
                  elevation: 0,
                },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.sendNowButtonText, { color: "#4B5563" }]}>
                HỦY
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sendNowButton, { flex: 1 }]}
              onPress={onSend}
            >
              <Text style={styles.sendNowButtonText}>GỬI NGAY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
