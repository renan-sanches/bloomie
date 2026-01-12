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

import 'react-native-gesture-handler';
import { Tabs } from "expo-router";
import { useSafeAreaInsets, SafeAreaProvider } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { IconSymbol } from "@/components/icon-symbol";
import { colors } from "@/components/ui/design-system";
import { AppProvider } from "@/lib/app-provider";

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
    <SafeAreaProvider>
      <AppProvider>
        <TabLayout />
      </AppProvider>
    </SafeAreaProvider>
  );
}

function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 64 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingTop: 12,
          paddingBottom: bottomPadding,
          paddingHorizontal: 16,
          height: tabBarHeight,
          backgroundColor: Platform.OS === 'web'
            ? 'rgba(255, 255, 255, 0.9)'
            : colors.surfaceLight,
          borderTopWidth: 0,
          // Glassmorphism effect for web
          ...(Platform.OS === 'web' && {
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }),
          // Shadow
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "My Jungle",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 28 : 24}
              name="house.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Care",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 28 : 24}
              name="calendar"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 28 : 24}
              name="camera.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 28 : 24}
              name="leaf.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 28 : 24}
              name="person.fill"
              color={color}
            />
          ),
        }}
      />

      {/* Hidden screens */}
      <Tabs.Screen
        name="onboarding"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="plant"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="auth"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
