import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        // ❌ Ẩn header mặc định vì sếp đã tự làm Header riêng rồi
        headerShown: false,
        // Hiệu ứng chuyển cảnh mượt mà giữa các màn hình auth
        animation: 'slide_from_right',
        // Giữ màu nền đồng nhất
        contentStyle: { backgroundColor: '#FFFFFF' }
      }}
    >
      {/* Khai báo các màn hình trong nhóm (không bắt buộc nhưng giúp quản lý tốt hơn) */}
      <Stack.Screen name="verify-phone" />
      <Stack.Screen name="otp-verification" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}