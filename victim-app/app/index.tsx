// app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Tự động điều hướng sang màn hình xác minh số điện thoại
  return <Redirect href="/(auth)/verify-phone" />;
}