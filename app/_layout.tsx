// Polyfill for Reanimated on Web
if (typeof window !== 'undefined') {
  // @ts-ignore
  window._frameTimestamp = null;
}

import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold
} from '@expo-google-fonts/plus-jakarta-sans';
import { useEffect } from 'react';
import { useRouter, useSegments, Stack } from 'expo-router';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "@/lib/app-provider";
import { useApp } from "@/lib/store";
import { NavigationBar } from "@/components/navigation-bar";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
    'PlusJakartaSans-ExtraBold': PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <AuthGuard>
            <NavigationBar />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="calendar" />
              <Stack.Screen name="scan" />
              <Stack.Screen name="discover" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="chat" />
              <Stack.Screen name="plant/[id]" />
              <Stack.Screen name="auth/login" />
              <Stack.Screen name="auth/signup" />
            </Stack>
          </AuthGuard>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Authentication guard component
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useApp();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Redirect unauthenticated users to login
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // Redirect authenticated users away from auth pages
      router.replace('/');
    }
  }, [user, isLoading, segments, router]);

  return <>{children}</>;
}
