import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import {
  MissionProvider,
} from "../src/context/MissionContext";
import {
  useRescuerLocationPublisher,
} from "../src/hooks/useRescuerLocationPublisher";

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useRescuerLocationPublisher();

  return (
  <MissionProvider>

    <ThemeProvider
      value={
        colorScheme === "dark"
          ? DarkTheme
          : DefaultTheme
      }
    >
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
        />

        <Stack.Screen
          name="DangNhap"
        />

        <Stack.Screen
          name="TrangChu"
        />

        <Stack.Screen
          name="(tabs)"
        />

        <Stack.Screen
          name="modal"
          options={{
            presentation:
              "modal",

            title: "Modal",
          }}
        />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>

  </MissionProvider>
);
}
