import { Dimensions, StyleSheet } from "react-native";
import { COLORS } from "../colors";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  // --- HEADER ---
  header: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8F9FB", paddingHorizontal: 16, paddingVertical: 14, justifyContent: "space-between" },
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

  // --- MÀN HÌNH CHÍNH ---
  instructionCard: { backgroundColor: "#F1F4FF", margin: 16, borderRadius: 20, padding: 20, elevation: 2 },
  instructionTitle: { fontSize: 20, fontWeight: "800", color: "#FF7A45", marginBottom: 12 },
  instructionItem: { fontSize: 16, color: "#454B5E", marginBottom: 6, fontWeight: "500" },
  sosContainer: { alignItems: "center", marginTop: 10, paddingHorizontal: 20 },
  sosButtonWrapper: { width: "100%", height: width * 0.9, borderRadius: 24, backgroundColor: "#F1F4FF", justifyContent: "center", alignItems: "center" },
  sosImage: { width: width * 0.65, height: width * 0.65 },

  // --- RADAR SOS ---
  mainBackground: { width: width, minHeight: height * 0.8 },
  mainBackgroundImage: { resizeMode: 'contain', top: -250, transform: [{ scale: 1.5 }] },
  statusText: { fontSize: 18, fontWeight: "500", color: "#555", textAlign: "center", marginTop: 30 },
  centerButtonContainer: { width: "100%", height: width * 0.8, justifyContent: "center", alignItems: "center" },
  huyButtonImage: { width: width * 0.55, height: width * 0.55 },
  incidentSection: { paddingHorizontal: 20, marginTop: -20 },
  incidentTitle: { fontSize: 16, fontWeight: "800", color: "#2D3142", textAlign: "center", marginBottom: 20 },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  incidentPill: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", width: "48%", paddingVertical: 12, paddingHorizontal: 12, borderRadius: 30, marginBottom: 15, elevation: 2, borderWidth: 1, borderColor: "#F0F0F0" },
  incidentPillSelected: { backgroundColor: "#FFF2EC", borderColor: COLORS.primary, borderWidth: 2 },
  incidentTextSelected: { color: COLORS.primary, fontWeight: "800" },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", marginRight: 10 },
  incidentText: { fontSize: 14, fontWeight: "600", color: "#333" },

  // --- MODAL TOÀN DIỆN ---
  modalBottomOverlay: { 
    position: 'absolute', // ✅ Ép phủ toàn màn hình để bắt chạm Unfocus
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)", 
    justifyContent: "flex-end" 
  },
  modalBottomSheetFull: { 
    backgroundColor: "#FFF", 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    paddingHorizontal: 25, 
    paddingTop: 12, 
    width: "100%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modalHandle: { 
    width: 60, 
    height: 5, 
    backgroundColor: "#E0E0E0", 
    borderRadius: 10, 
    marginBottom: 20, 
    alignSelf: 'center' // ✅ CĂN GIỮA TUYỆT ĐỐI
  },
  sendNowButton: { 
    width: "100%", 
    backgroundColor: "#FF8852", 
    paddingVertical: 18, 
    borderRadius: 20, 
    alignItems: "center", 
    shadowColor: "#FF8852", 
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
    elevation: 6,
    marginBottom: 0 // Để paddingBottom của Modal kiểm soát khoảng cách lề dưới
  },
  closeModalBtn: { position: "absolute", top: 20, right: 25, zIndex: 10 },

  // --- PHẦN NHẬP LIỆU ---
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, width: '100%' },
  formTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  formTitleText: { fontSize: 20, fontWeight: '800', color: '#2D3142', marginLeft: 8 },
  infoCard: { backgroundColor: '#F8F9FB', borderRadius: 20, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#F0F0F0' },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  smallAvatar: { width: 45, height: 45, borderRadius: 12 },
  infoTextColumn: { flex: 1, paddingHorizontal: 12 },
  infoName: { fontSize: 15, fontWeight: '700', color: '#2D3142' },
  infoPhone: { fontWeight: '400', color: '#777' },
  infoLocationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoAddress: { fontSize: 13, color: '#555', marginLeft: 4, flex: 1 },
  formInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 15, padding: 15, height: 100, textAlignVertical: 'top', fontSize: 16, color: '#2D3142', marginBottom: 20 },
  mediaActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  mediaTile: { width: '30%', aspectRatio: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  mediaText: { fontSize: 13, color: '#555', marginTop: 8, fontWeight: '500' },

  // --- NÚT GỬI ---
  sendNowButtonText: { color: "#FFF", fontSize: 18, fontWeight: "bold", },

  // --- ĐẾM NGƯỢC ---
  modalTitle: { fontSize: 24, fontWeight: "900", color: "#FF8852", textAlign: 'center', marginTop: 10 },
  modalSubTitle: { fontSize: 16, color: "#666", textAlign: 'center', marginVertical: 8 },
  countdownCircleLarge: { width: 180, height: 180, borderRadius: 90, borderWidth: 4, borderColor: "#FF8852", borderStyle: "dashed", justifyContent: "center", alignItems: "center", marginVertical: 30, alignSelf: 'center' },
  countdownNumberLarge: { fontSize: 80, fontWeight: "bold", color: "#000" },
  countdownUnitLarge: { fontSize: 16, color: "#AAA", letterSpacing: 2 },
  // ✅ STYLE MỚI CHO HIỂN THỊ ẢNH Thumbnail
  imageListContainer: {
    paddingVertical: 15,
    paddingHorizontal: 5,
    marginBottom: 5,
    alignItems: 'center',
    width: '100%',
  },
  formThumbnailWrapper: {
    width: 100,
    height: 100,
    borderRadius: 15,
    marginRight: 15,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
    position: 'relative', // Để nút xóa absolute
  },
  formThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    zIndex: 10,
  },
});