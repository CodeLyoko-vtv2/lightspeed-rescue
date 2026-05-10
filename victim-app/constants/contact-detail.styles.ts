import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#dddddd66" // Màu sếp vừa chỉnh, rất mượt
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#2D3142" },
  addButton: { flexDirection: "row", alignItems: "center" },
  addButtonText: { fontSize: 17, fontWeight: "600", color: COLORS.primary, marginLeft: 4 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    height: 55,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#EEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 17, color: "#333" },

  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  groupCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F1F2F6",
    padding: 12,
    borderRadius: 25,
    marginBottom: 15,
  },
  groupInfoLeft: { flexDirection: "row", alignItems: "center" },
  groupImage: { width: 50, height: 50, borderRadius: 25 },
  groupName: { fontSize: 19, fontWeight: "600", color: "#2D3142", marginLeft: 15 },
});