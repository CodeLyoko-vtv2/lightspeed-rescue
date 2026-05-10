import { Dimensions, Platform, StyleSheet } from "react-native";
import { COLORS } from "../colors";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  inner: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 30,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  topSection: {
    width: "100%", // Đảm bảo chiếm hết chiều ngang để đặt nút Back
    alignItems: "center",
    justifyContent: "center",
    marginTop: Platform.OS === "ios" ? 0 : 20,
    position: "relative", // Làm mốc cho nút Back
  },
  backButton: {
    position: "absolute",
    left: 0, // Nằm sát lề trái padding của content
    padding: 10,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: "900",
    color: COLORS.primary,
    textAlign: "center",
  },
  middleSection: {
    marginTop: 60,
    flex: 1,
  },
  inputLabel: {
    fontSize: 22,
    color: COLORS.textNormal,
    marginBottom: 30,
    fontWeight: "700",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  otpBox: {
    width: (width - 120) / 4, // ✅ Tự động tính toán để không bị tràn màn hình
    height: 75,
    borderRadius: 20,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
  },
  otpText: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textBold,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
  },
  resendContainer: {
    marginTop: 15,
  },
  resendText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  resendLink: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 10 : 0,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    width: "100%",
    height: 80,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
  },
  actionButtonText: {
    color: "#ffffff79", // Mặc định mờ 70%
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 2,
  },
  actionButtonTextActive: {
    color: "#FFFFFF", // ✅ Sáng trắng 100% khi active
  },
});
