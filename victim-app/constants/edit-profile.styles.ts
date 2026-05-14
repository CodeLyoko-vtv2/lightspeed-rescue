import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFD" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: COLORS.textBold },

  scrollContent: { paddingHorizontal: 25, paddingBottom: 40 },

  avatarContainer: { alignItems: "center", marginTop: 30, marginBottom: 40 },
  avatarWrapper: {
    width: 210,
    height: 210,
    borderRadius: 200,
    backgroundColor: "#F0F2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    // Shadow cho avatar tròn chuẩn Figma
    shadowColor: "#5C6BC0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  avatar: { width: 210, height: 210, borderRadius: 200 },
  profileName: { fontSize: 22, fontWeight: "800", color: "#2D3142" },
  profileUsername: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },

  form: { gap: 15 },
  inputGroup: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 60,
    justifyContent: "center",
    // Shadow nhẹ cho ô input
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  input: { fontSize: 18, color: COLORS.textNormal, fontWeight: "500" },
  rowInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputText: { fontSize: 18, fontWeight: "500", color: COLORS.textNormal },

  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  vLine: { width: 1, height: 20, backgroundColor: "#EEE", marginLeft: 10 },

  submitButton: {
    backgroundColor: COLORS.primary, // Màu cam san hồi
    height: 65,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitButtonText: { color: "#FFF", fontSize: 19, fontWeight: "700" },
});
