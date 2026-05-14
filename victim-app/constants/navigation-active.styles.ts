import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "./colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E0E0E0" },
  map: { flex: 1 },

  // Panel hướng dẫn trên cùng
  topInstruction: {
    position: "absolute",
    left: 15,
    right: 15,
    backgroundColor: "#0A5D4A", // Màu xanh lục đậm đặc trưng
    borderRadius: 15,
    padding: 15,
    zIndex: 10,
  },
  instructionMain: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  instructionText: { color: "#FFF", fontSize: 28, fontWeight: "700", flex: 1, marginLeft: 15 },
  micBtn: { backgroundColor: "#FFF", width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  nextStep: { backgroundColor: "#064436", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginTop: 10, flexDirection: "row", alignItems: "center" },
  nextStepText: { color: "#FFF", marginRight: 8, fontWeight: "600" },

  // Label tên đường lơ lửng
  streetLabelWrapper: { position: "absolute", top: "50%", alignSelf: "center", alignItems: "center" },
  streetLabel: { backgroundColor: "#FF8852", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  streetLabelText: { color: "#FFF", fontWeight: "700" },
  streetLabelArrow: { width: 0, height: 0, borderLeftWidth: 8, borderLeftColor: "transparent", borderRightWidth: 8, borderRightColor: "transparent", borderTopWidth: 8, borderTopColor: "#FF8852" },

  // Đồng hồ tốc độ
  speedWrapper: { position: "absolute", bottom: 120, left: 20, width: 70, height: 70, borderRadius: 35, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", elevation: 5, shadowOpacity: 0.1 },
  speedValue: { fontSize: 28, fontWeight: "bold", color: "#333" },
  speedUnit: { fontSize: 15, color: "#777" },

  // Nút bên phải
  sideControls: { position: "absolute", right: 20, top: "60%", gap: 15 },
  sideIconBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", elevation: 3 },

  // Panel thông tin dưới cùng
  bottomInfo: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#FFF", borderTopLeftRadius: 30, borderTopRightRadius: 30, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 25, paddingTop: 15 },
  closeBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#F5F5F5", justifyContent: "center", alignItems: "center" },
  statsContainer: { alignItems: "center" },
  timeValue: { fontSize: 28, fontWeight: "bold", color: "#0A5D4A" },
  distValue: { fontSize: 24, color: "#777", fontWeight: "500" },
  recenterBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#F5F5F5", justifyContent: "center", alignItems: "center" },
  
  navigationArrow: { transform: [{ rotate: '-45deg' }] },
carMarkerWrapper: {
    backgroundColor: "#FFF",
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    // Đổ bóng cho marker nổi bật trên bản đồ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }

});