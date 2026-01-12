import { Pressable, Text, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { useEffect } from "react";

type Props = {
  showHint?: boolean;
};

export function BloomieBuddyButton({ showHint = false }: Props) {
  const bounceAnim = useSharedValue(0);
  const hintOpacity = useSharedValue(0);

  useEffect(() => {
    // Gentle bounce animation
    bounceAnim.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 500 }),
        withTiming(0, { duration: 500 })
      ),
      -1,
      true
    );

    // Show hint after delay
    if (showHint) {
      hintOpacity.value = withDelay(2000, withTiming(1, { duration: 300 }));
    }
  }, [bounceAnim, hintOpacity, showHint]);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounceAnim.value }],
  }));

  const hintStyle = useAnimatedStyle(() => ({
    opacity: hintOpacity.value,
  }));

  const triggerHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePress = () => {
    triggerHaptic();
    router.push("/chat" as any);
  };

  return (
    <View style={styles.container}>
      {showHint && (
        <Animated.View style={[styles.hintBubble, hintStyle]}>
          <Text style={styles.hintText}>Need help? Ask me! 🌱</Text>
          <View style={styles.hintArrow} />
        </Animated.View>
      )}
      <Animated.View style={bounceStyle}>
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.emoji}>🌱</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

import { colors } from "@/components/ui/design-system";

// ... existing code ...

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 160,
    right: 20,
    alignItems: "flex-end",
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: "#F5FFF0",
  },
  emoji: {
    fontSize: 28,
  },
  hintBubble: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
    position: "relative",
  },
  hintText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  hintArrow: {
    position: "absolute",
    bottom: -6,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: colors.primaryDark,
  },
});
