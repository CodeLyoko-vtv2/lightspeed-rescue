import { useState, useEffect, createContext, useContext } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
// ✅ Import CustomSplash của sếp
import CustomSplash from '../components/CustomSplash'; 

// 🔑 Bộ khung quản lý trạng thái đăng nhập
const AuthContext = createContext({
  isAuth: false,
  setAuth: (value: boolean) => {},
});

export const useAuth = () => useContext(AuthContext);

// Ngăn splash screen của hệ thống tự ẩn để mình điều khiển
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true); // ✅ Quản lý CustomSplash
  
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // 1. Kiểm tra sếp đã đăng nhập chưa
      const userPhone = await AsyncStorage.getItem('userPhone');
      if (userPhone) setIsAuth(true);
    } catch (e) {
      console.error(e);
    } finally {
      // 2. Xong việc thì báo App đã sẵn sàng và ẩn Splash hệ thống
      setAppReady(true);
      SplashScreen.hideAsync();
    }
  };

  // 🛡️ Hệ thống điều hướng thông minh dựa trên trạng thái Auth
  useEffect(() => {
    // Chỉ điều hướng khi app đã sẵn sàng VÀ CustomSplash đã biến mất
    if (!appReady || splashVisible) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuth && !inAuthGroup) {
      router.replace('/(auth)/verify-phone');
    } else if (isAuth && inAuthGroup) {
      router.replace('/(tabs)/home');
    }
  }, [isAuth, appReady, segments, splashVisible]);

  if (!appReady) return null;

  return (
    <AuthContext.Provider value={{ isAuth, setAuth: setIsAuth }}>
      <SafeAreaProvider>
        {/* Render các màn hình ngầm bên dưới */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>

        {/* ✅ Lớp CustomSplash phủ lên trên cùng khi khởi động */}
        {splashVisible && (
          <CustomSplash 
            onFinish={() => {
              setSplashVisible(false); // Khi hiệu ứng 3s kết thúc, ẩn Splash
            }} 
          />
        )}
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}