/**
 * LIGHTSPEED RESCUE - VICTIM APP COLORS
 * Chủ đạo: Cam San Hô (Khẩn cấp & Nổi bật)
 */

export const COLORS = {
  // Màu chủ đạo (Primary)
  primary: '#FF8852',

  // Hệ thống màu chữ (Text System)
  textBold: '#000000',          // Chữ đậm, tiêu đề
  textNormal: '#000000B3',      // Chữ bình thường (70% opacity - Hex: B3)
  textMuted: '#0000004D',       // Chữ mờ, chú thích (30% opacity - Hex: 4D)
  textLight: '#00000080',       // Chữ sáng, phụ trợ (50% opacity - Hex: 80)

  // Bổ sung các màu nền cơ bản để sếp dễ dùng
  white: '#FFFFFF',
  background: '#F8F9FB',
  error: '#FF4D4D',
};

export type ColorType = typeof COLORS;