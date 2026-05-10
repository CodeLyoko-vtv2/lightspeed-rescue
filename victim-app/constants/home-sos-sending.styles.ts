// constants/home-sos-sending.styles.ts
import { Dimensions, StyleSheet } from "react-native";
import { COLORS } from "./colors";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  // --- HEADER ---
  header: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8F9FB", paddingHorizontal: 16, paddingVertical: 14, justifyContent: "space-between", zIndex: 10 },
  userInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatarWrapper: { borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 14, padding: 2 },
  avatar: { width: 50, height: 50, borderRadius: 12 },
  userTextContainer: { flex: 1, paddingLeft: 12, paddingRight: 8 },
  userName: { fontSize: 18, fontWeight: "700", color: COLORS.textNormal },
  userPhone: { fontSize: 16, fontWeight: "500", color: COLORS.textLight },
  locationContainer: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  locationText: { fontSize: 15, color: COLORS.textNormal, marginLeft: 4, fontWeight: "600" },
  iconButton: { padding: 4, position: 'relative' },
  notificationDot: { position: 'absolute', top: 2, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error, borderWidth: 1.5, borderColor: '#F8F9FB' },

  // --- BODY STYLES (BACKGROUND NỀN MỜ) ---
  mainBackground: {
    flex: 1,
    width: "100%",
  },
  mainBackgroundImage: {
    // Để ảnh cover phủ đẹp, kéo dãn cho phù hợp với đủ loại màn hình
    resizeMode: "cover",
    opacity: 0.9, 
  },

  statusText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#555",
    textAlign: "center",
    marginTop: 30, // Đẩy xuống một chút cho thoáng
  },

  // Khu vực chứa nút Hủy
  centerButtonContainer: {
    width: "100%",
    height: width * 0.9, // Tạo một vùng không gian hình vuông lớn ở giữa để canh nút
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Nút "Chạm để hủy" sếp gửi
  huyButtonImage: {
    width: width * 0.55, // Căn chỉnh kích thước nút vừa phải so với màn hình
    height: width * 0.55,
  },

  // --- CHỌN SỰ CỐ ---
  incidentSection: {
    paddingHorizontal: 20,
    marginTop: -10, 
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2D3142",
    textAlign: "center",
    marginBottom: 20,
  },
  
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  incidentPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    width: "48%", 
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 30, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  incidentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});