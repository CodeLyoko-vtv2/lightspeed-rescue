import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  map: { flex: 1 },

  arrivalMarkerWrapper: { flexDirection: 'row', alignItems: 'center' },
  orangeDotOuter: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(255, 136, 82, 0.2)", justifyContent: "center", alignItems: "center" },
  orangeDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF8852", borderWidth: 2, borderColor: "#FFF" },

  sideButtons: { position: 'absolute', right: 15, top: '45%', gap: 10 },
  sideBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 3 },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  arrivalTitle: { fontSize: 26, fontWeight: "bold", color: "#333" },
  addressText: { fontSize: 16, color: "#555", marginTop: 4 },
  subText: { fontSize: 14, color: "#999", marginTop: 2 },

  placeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FB",
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#F0F0F0"
  },
  placeName: { fontSize: 18, fontWeight: "600", color: "#333" },
  placeCategory: { fontSize: 15, color: "#777", marginTop: 2 },

  actionRow: { flexDirection: "row", justifyContent: "space-between" },
  actionBtn: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center",
    height: 45,
    backgroundColor: "#FFF",
    borderRadius: 22.5,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#EEE"
  },
  actionBtnText: { marginLeft: 8, fontSize: 15, fontWeight: "600", color: "#555" },
  parkingIcon: { width: 20, height: 20, backgroundColor: "#FF8852", borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  parkingText: { color: "#FFF", fontSize: 14, fontWeight: "bold" }
});