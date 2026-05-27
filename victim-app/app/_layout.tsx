import { useState, useEffect, createContext, useContext } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import CustomSplash from '../components/CustomSplash';

const AuthContext = createContext({
  isAuth: false,
  setAuth: (value: boolean) => {},
});

export const useAuth = () => useContext(AuthContext);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          await AsyncStorage.setItem('userUid', user.uid);
          setIsAuth(true);
        } else {
          await AsyncStorage.multiRemove(['userPhone', 'userUid', 'userRole']);
          setIsAuth(false);
        }
      } catch (e) {
        console.error(e);
        setIsAuth(false);
      } finally {
        setAppReady(true);
        SplashScreen.hideAsync();
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!appReady || splashVisible) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuth && !inAuthGroup) {
      router.replace('/(auth)/verify-phone');
    } else if (isAuth && inAuthGroup) {
      router.replace('/(tabs)/home');
    }
  }, [isAuth, appReady, segments, splashVisible, router]);

  if (!appReady) return null;

  return (
    <AuthContext.Provider value={{ isAuth, setAuth: setIsAuth }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>

        {splashVisible && (
          <CustomSplash
            onFinish={() => {
              setSplashVisible(false);
            }}
          />
        )}
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}
