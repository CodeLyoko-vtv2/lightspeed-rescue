// constants/(tabs)/map.styles.ts
import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../colors";

export const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },

  // Search Bar
  searchWrapper: { position: "absolute", left: 0, right: 0, zIndex: 10 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 15,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 17 },
  searchAvatar: { width: 32, height: 32, borderRadius: 16 },

  // Chips
  chipScroll: { marginTop: 10, paddingLeft: 15, paddingBottom: 5 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  chipText: { marginLeft: 6, fontWeight: "600", color: "#333" },

  // Nút bên phải
  rightButtons: { position: "absolute", right: 15, top: 200, gap: 10 },
  sideButton: {
    backgroundColor: "#FFF",
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  // Nút bên dưới
  bottomButtons: { position: "absolute", right: 15, bottom: 100, gap: 15 },
  myLocationButton: {
    backgroundColor: "#FFF",
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  directionButton: {
    backgroundColor: COLORS.primary, // Nút màu cam
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

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