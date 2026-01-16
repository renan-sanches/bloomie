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
import { useRouter, useSegments } from 'expo-router';

import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets, SafeAreaProvider } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { IconSymbol } from "@/components/icon-symbol";
import { colors } from "@/components/ui/design-system";
import { AppProvider, useApp } from "@/lib/app-provider";
import { Header } from "@/components/header";
import { View } from "react-native";

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
            <Header />
            <View style={{ flex: 1 }}>
              <TabLayout />
            </View>
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

import { Drawer } from 'expo-router/drawer';

// ...

function TabLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.gray900,
        drawerType: Platform.OS === 'web' ? 'permanent' : 'front',
        drawerLabelStyle: {
          fontFamily: 'PlusJakartaSans-SemiBold',
          marginLeft: -16,
        },
        drawerStyle: {
          backgroundColor: colors.surfaceLight,
          width: Platform.OS === 'web' ? 280 : '80%',
          borderRightWidth: 1,
          borderRightColor: colors.gray100,
        }
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "My Jungle",
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <IconSymbol name="house.fill" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="calendar"
        options={{
          title: "Care",
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <IconSymbol name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="scan"
        options={{
          title: "Scan",
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <IconSymbol name="camera.fill" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="discover"
        options={{
          title: "Discover",
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <IconSymbol name="leaf.fill" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: "Profile",
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <IconSymbol name="person.fill" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden screens */}
      <Drawer.Screen
        name="chat"
        options={{
          drawerItemStyle: { display: 'none' }
        }}
      />
      <Drawer.Screen
        name="plant"
        options={{
          drawerItemStyle: { display: 'none' }
        }}
      />
      <Drawer.Screen
        name="auth"
        options={{
          drawerItemStyle: { display: 'none' },
          swipeEnabled: false,
        }}
      />
    </Drawer>
  );
}
