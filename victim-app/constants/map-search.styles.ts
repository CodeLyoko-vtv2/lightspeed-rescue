import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backButton: { padding: 5 },
  searchInput: { flex: 1, marginHorizontal: 10, fontSize: 19, color: "#333" },

  // Quick Actions
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: "space-between",
  },
  actionItemWrapper: { flexDirection: "row", alignItems: "center", flex: 1 },
  actionCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTextWrapper: { marginLeft: 10 },
  actionTitle: { fontSize: 14, fontWeight: "600", color: "#333" },
  actionSubtitle: { fontSize: 14, color: "#999" },

  divider: { height: 1, backgroundColor: "#EEE", marginHorizontal: 20 },

  // Section
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#000" },

  // List Item
  recentItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
  },
  historyIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  locationInfo: { flex: 1, borderBottomWidth: 0.5, borderBottomColor: "#EEE", paddingBottom: 10 },
  locationName: { fontSize: 17, fontWeight: "500", color: "#333" },
  locationAddress: { fontSize: 15, color: "#777", marginTop: 2 },
  locationStatus: { fontSize: 15, marginTop: 2, fontWeight: "500" },

  footerButton: { paddingVertical: 25, alignItems: "center" },
  footerText: { color: COLORS.primary, fontSize: 17, fontWeight: "600" },
});