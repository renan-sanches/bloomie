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
import { useRouter, useSegments } from 'expo-router';

import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets, SafeAreaProvider } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { IconSymbol } from "@/components/icon-symbol";
import { colors } from "@/components/ui/design-system";
import { AppProvider } from "@/lib/app-provider";
import { useApp } from "@/lib/store";
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

import { Tabs } from 'expo-router';

// ...

function TabLayout() {
  if (Platform.OS === 'web') {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray500,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "My Jungle",
            tabBarIcon: ({ color, size }) => (
              <IconSymbol name="house.fill" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Care",
            tabBarIcon: ({ color, size }) => (
              <IconSymbol name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: "Scan",
            tabBarIcon: ({ color, size }) => (
              <IconSymbol name="camera.fill" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: "Discover",
            tabBarIcon: ({ color, size }) => (
              <IconSymbol name="leaf.fill" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <IconSymbol name="person.fill" size={size} color={color} />
            ),
          }}
        />

        {/* Hidden screens */}
        <Tabs.Screen name="chat" options={{ href: null }} />
        <Tabs.Screen name="plant" options={{ href: null }} />
        <Tabs.Screen name="auth" options={{ href: null }} />
      </Tabs>
    );
  }

  // Dynamically import Drawer for native platforms to avoid Reanimated issues on web
  const { Drawer } = require('expo-router/drawer');

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.gray900,
        drawerType: 'front',
        drawerLabelStyle: {
          fontFamily: 'PlusJakartaSans-SemiBold',
          marginLeft: -16,
        },
        drawerStyle: {
          backgroundColor: colors.surfaceLight,
          width: '80%',
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
