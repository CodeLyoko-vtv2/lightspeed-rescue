import { Dimensions, Platform, StyleSheet } from "react-native";
import { COLORS } from "../colors";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  inner: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "space-between", // ✅ Phân bố 3 phần (Top, Middle, Bottom)
    paddingTop: 30,
    paddingBottom: 20,
  },
  topSection: {
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 0 : 20,
  },
  headerTitle: {
    fontSize: 40, // ✅ Font dầy và lớn
    fontWeight: "900", // ✅ Đậm nhất
    color: COLORS.primary, // ✅ Màu Cam chủ đạo
    textAlign: "center",
    letterSpacing: 1,
  },
  middleSection: {
    alignItems: "center",
    marginTop: 50,
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 30,
  },
  logo: {
    width: width * 0.45, // ✅ Larger proportion from splash
    height: width * 0.45,
    marginBottom: 10, // ✅ Khoảng cách thưa hơn
  },
  inputSection: {
    width: "100%",
  },
  inputLabel: {
    fontSize: 22,
    color: COLORS.textNormal,
    marginBottom: 30,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5, // ✅ Border mảnh
    borderColor: COLORS.primary, // ✅ Màu Cam chủ đạo
    borderRadius: 16,
    height: 60,
    paddingHorizontal: 15,
    backgroundColor: "#FFF",
  },
  countryCode: {
    fontSize: 18,
    color: COLORS.textNormal, // ✅ Màu xám mờ 70%
    fontWeight: "500",
  },
  separator: {
    height: 24,
    width: 1.5,
    backgroundColor: "#E8E8E8", // ✅ Thanh separator xám cực mảnh
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textNormal, // ✅ Màu đen
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
    marginBottom: 30, // ✅ Khoảng cách từ nút đến footer link
  },
  actionButtonText: {
    color: "#ffffffB3", // ✅ Màu trắng mờ 70%
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 2,
  },
  actionButtonTextActive: {
    color: "#FFFFFF", // ✅ Trắng tinh khi tập trung nhập liệu
  },
  footerLink: {
    alignSelf: "center",
  },
  footerText: {
    fontSize: 20,
    color: COLORS.textLight, // ✅ Màu đen mờ 70%
    fontWeight: "600",
  },
});
