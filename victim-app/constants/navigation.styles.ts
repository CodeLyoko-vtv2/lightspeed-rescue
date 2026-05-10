import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { backgroundColor: "#FFF", elevation: 4, zIndex: 10, paddingBottom: 10 },
  inputRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15 },
  inputsWrapper: { flex: 1, marginLeft: 10 },
  inputField: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#F8F9FB", 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    height: 40,
    borderWidth: 1,
    borderColor: "#EEE"
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  textInput: { flex: 1, fontSize: 15, color: "#333" },
  verticalDash: { width: 1, height: 15, borderStyle: "dashed", borderWidth: 1, borderColor: "#999", marginLeft: 15 },

  modeScroll: { marginTop: 15, paddingLeft: 15 },
  modeBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, backgroundColor: "#F5F5F5" },
  modeBtnActive: { backgroundColor: "#E3F2FD", borderWidth: 1, borderColor: COLORS.primary },
  modeText: { marginLeft: 5, color: "#555", fontWeight: "500" },
  modeTextActive: { marginLeft: 5, color: COLORS.primary, fontWeight: "700" },

  map: { flex: 1 },
  originMarker: { width: 16, height: 16, borderRadius: 8, backgroundColor: "#FFF", borderWidth: 4, borderColor: COLORS.primary },

  bottomPanel: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#FFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, elevation: 20 },
  dragHandle: { width: 40, height: 4, backgroundColor: "#EEE", borderRadius: 2, alignSelf: "center", marginBottom: 15 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  timeText: { fontSize: 22, fontWeight: "bold", color: "#000" },
  distText: { color: "#777", fontWeight: "normal" },
  subInfoText: { color: "#777", marginTop: 4, fontSize: 13 },
  shareIcon: { padding: 5, backgroundColor: "#F5F5F5", borderRadius: 20 },

  btnRow: { flexDirection: "row", marginTop: 20, gap: 15 },
  startBtn: { flex: 1, backgroundColor: "#FF8852", flexDirection: "row", height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
  startBtnText: { color: "#FFF", fontSize: 18, fontWeight: "bold", marginLeft: 8 },
  stepsBtn: { flex: 1, backgroundColor: "#E3F2FD", flexDirection: "row", height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
  stepsBtnText: { color: COLORS.primary, fontSize: 18, fontWeight: "bold", marginLeft: 8 },
});