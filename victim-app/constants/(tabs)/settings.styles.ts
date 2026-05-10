// constants/(tabs)/settings.styles.ts
import { StyleSheet } from "react-native";
import { COLORS } from "../colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB", marginBottom: 50 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#2D3142",
    marginLeft: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: 15,
    marginTop: 10,
  },

  // --- PROFILE CARD ---
  profileCard: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
    // Đổ bóng cho Card
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  profileInfo: {
    flex: 1,
    paddingLeft: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF",
  },
  profileUsername: {
    fontSize: 22,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  editButton: {
    padding: 5,
  },

  // --- MENU LIST ---
  menuGroup: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 10,
    marginBottom: 20,
    // Shadow nhẹ cho khối trắng
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  iconWrapper: {
    width: 45,
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F2FF", // Màu nền vòng tròn icon sáng
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    flex: 1,
    paddingLeft: 15,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3142",
  },
  menuSubtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});