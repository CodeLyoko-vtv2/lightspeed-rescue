import { StyleSheet } from "react-native";
import { COLORS } from "../colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#dddddd66"

  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#2D3142" },
  addButton: { flexDirection: "row", alignItems: "center" },
  addButtonText: { fontSize: 16, fontWeight: "600", color: COLORS.primary, marginLeft: 4 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 25,
    paddingHorizontal: 20,
    height: 55,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#EEE",
    // Shadow cho thanh search nhẹ nhàng
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#333" },

  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  groupCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F1F2F6", // Màu nền card xám nhạt đúng Figma
    padding: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  groupInfoLeft: { flexDirection: "row", alignItems: "center" },
  groupImage: { width: 55, height: 55, borderRadius: 27.5 },
  groupIconWrapper: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: "center",
    alignItems: "center",
  },
  groupName: { fontSize: 20, fontWeight: "500", color: COLORS.textNormal, marginLeft: 15 },
  contactCount: { fontSize: 14, color: COLORS.textMuted, fontWeight: "500" },
});