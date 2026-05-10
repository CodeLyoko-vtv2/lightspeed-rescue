// constants/place-detail.styles.ts
import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  map: { width: "100%", height: "78%" }, // ✅ Tăng diện tích bản đồ khi Bottom Sheet lùn xuống

  floatingHeader: {
    position: "absolute",
    left: 15,
    right: 15,
    backgroundColor: "#FFF",
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    elevation: 5,
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  backBtn: { marginRight: 10 },
  headerSearchText: { flex: 1, fontSize: 16, color: "#333" },

  myLocationBtn: {
    position: "absolute",
    right: 15,
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 25,
    elevation: 5,
    zIndex: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  dragHandleIndicator: {
    width: 40,
    backgroundColor: "#CCC",
  },
  bottomSheetBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#FFF",
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  titleSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    alignItems: "flex-start",
    marginTop: 10,
  },
  placeName: { fontSize: 22, fontWeight: "600", color: "#333", flex: 1 },
  shareBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },

  actionRow: { paddingLeft: 20, marginVertical: 20 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  actionBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  actionBtnTextWhite: { color: "#FFF", fontWeight: "600", marginLeft: 8 },
  actionBtnText: { color: COLORS.primary, fontWeight: "600", marginLeft: 8 },

  imageGallery: { paddingLeft: 20, marginBottom: 20 },
  galleryImgLarge: { width: 220, height: 160, borderRadius: 15, marginRight: 10 },
  galleryImgSmall: { width: 140, height: 75, borderRadius: 15 },

  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingHorizontal: 20,
  },
  tabItem: { paddingVertical: 15, marginRight: 25, fontSize: 15, color: "#777" },
  tabActive: { color: COLORS.primary, borderBottomWidth: 2, borderBottomColor: COLORS.primary, fontWeight: "700" },

  infoSection: { padding: 20, gap: 20 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 15 },
  infoText: { fontSize: 15, color: "#333", flex: 1 },
  statusText: { fontSize: 15, color: "#FF9800", fontWeight: "600" },
  subInfoText: { fontSize: 13, color: "#777" },

  // Marker chấm cam
  orangeDotOuter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 136, 82, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  orangeDotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: "#FFF",
  },
});