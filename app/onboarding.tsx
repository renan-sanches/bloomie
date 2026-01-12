import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Dimensions,
  FlatList,
  StyleSheet,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/store";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const { width } = Dimensions.get("window");

type ExperienceLevel = "beginner" | "growing" | "expert";

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  type: "welcome" | "quiz" | "notification" | "addPlant" | "celebration";
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Bloomie!",
    subtitle: "Your personal plant care companion. Let's grow together!",
    emoji: "🌱",
    type: "welcome",
  },
  {
    id: "quiz",
    title: "What kind of plant parent are you?",
    subtitle: "This helps us personalize your experience",
    emoji: "🪴",
    type: "quiz",
  },
  {
    id: "notification",
    title: "Can we remind you to water?",
    subtitle: "We'll send gentle nudges so your plants stay happy",
    emoji: "💧",
    type: "notification",
  },
  {
    id: "addPlant",
    title: "Add your first plant",
    subtitle: "Start building your jungle!",
    emoji: "🌿",
    type: "addPlant",
  },
  {
    id: "celebration",
    title: "Welcome to your jungle!",
    subtitle: "You're all set to become the best plant parent ever",
    emoji: "🎉",
    type: "celebration",
  },
];

const EXPERIENCE_OPTIONS: { level: ExperienceLevel; title: string; description: string; emoji: string }[] = [
  {
    level: "beginner",
    title: "Beginner",
    description: "I'm new to plants and need guidance",
    emoji: "🌱",
  },
  {
    level: "growing",
    title: "Growing",
    description: "I have some plants but want to learn more",
    emoji: "🌿",
  },
  {
    level: "expert",
    title: "Expert",
    description: "I'm a seasoned plant parent",
    emoji: "🌳",
  },
];

export default function OnboardingScreen() {
  const { updatePreferences, updateProfile, preferences } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  // Bounce animation for emojis
  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    bounce.start();
    return () => bounce.stop();
  }, [bounceAnim]);

  // Confetti animation on celebration step
  useEffect(() => {
    if (currentStep === ONBOARDING_STEPS.length - 1) {
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [currentStep, confettiAnim]);

  const triggerHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const goToNextStep = () => {
    triggerHaptic();
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      flatListRef.current?.scrollToIndex({ index: nextStep, animated: true });
    }
  };

  const handleLevelSelect = (level: ExperienceLevel) => {
    triggerHaptic();
    setSelectedLevel(level);
    updateProfile({ experienceLevel: level });
  };

  const handleNotificationChoice = async (enabled: boolean) => {
    triggerHaptic();
    await updatePreferences({ notificationsEnabled: enabled });
    goToNextStep();
  };

  const handleAddPlantChoice = (method: "scan" | "search" | "browse" | "skip") => {
    triggerHaptic();
    if (method === "skip") {
      goToNextStep();
    } else {
      // For now, skip to celebration - plant adding will be done from dashboard
      goToNextStep();
    }
  };

  const handleComplete = async () => {
    triggerHaptic();
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await updatePreferences({ onboardingCompleted: true });
    router.replace("/(tabs)");
  };

  const renderStep = ({ item, index }: { item: OnboardingStep; index: number }) => {
    return (
      <View style={[styles.stepContainer, { width }]}>
        <View style={styles.contentContainer}>
          {/* Animated Emoji */}
          <Animated.View style={[styles.emojiContainer, { transform: [{ scale: bounceAnim }] }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
          </Animated.View>

          {/* Title and Subtitle */}
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>

          {/* Step-specific content */}
          {item.type === "welcome" && (
            <View style={styles.actionContainer}>
              <Pressable
                onPress={goToNextStep}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </Pressable>
            </View>
          )}

          {item.type === "quiz" && (
            <View style={styles.quizContainer}>
              {EXPERIENCE_OPTIONS.map((option) => (
                <Pressable
                  key={option.level}
                  onPress={() => handleLevelSelect(option.level)}
                  style={({ pressed }) => [
                    styles.quizOption,
                    selectedLevel === option.level && styles.quizOptionSelected,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.quizEmoji}>{option.emoji}</Text>
                  <View style={styles.quizTextContainer}>
                    <Text style={[
                      styles.quizTitle,
                      selectedLevel === option.level && styles.quizTitleSelected,
                    ]}>
                      {option.title}
                    </Text>
                    <Text style={styles.quizDescription}>{option.description}</Text>
                  </View>
                </Pressable>
              ))}
              {selectedLevel && (
                <Pressable
                  onPress={goToNextStep}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { marginTop: 24 },
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </Pressable>
              )}
            </View>
          )}

          {item.type === "notification" && (
            <View style={styles.actionContainer}>
              <Pressable
                onPress={() => handleNotificationChoice(true)}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.primaryButtonText}>Yes, remind me!</Text>
              </Pressable>
              <Pressable
                onPress={() => handleNotificationChoice(false)}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>Maybe later</Text>
              </Pressable>
            </View>
          )}

          {item.type === "addPlant" && (
            <View style={styles.actionContainer}>
              <Pressable
                onPress={() => handleAddPlantChoice("scan")}
                style={({ pressed }) => [
                  styles.addPlantOption,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.addPlantEmoji}>📷</Text>
                <Text style={styles.addPlantText}>Scan a Plant</Text>
              </Pressable>
              <Pressable
                onPress={() => handleAddPlantChoice("search")}
                style={({ pressed }) => [
                  styles.addPlantOption,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.addPlantEmoji}>🔍</Text>
                <Text style={styles.addPlantText}>Search by Name</Text>
              </Pressable>
              <Pressable
                onPress={() => handleAddPlantChoice("browse")}
                style={({ pressed }) => [
                  styles.addPlantOption,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.addPlantEmoji}>🌿</Text>
                <Text style={styles.addPlantText}>Browse Popular</Text>
              </Pressable>
              <Pressable
                onPress={() => handleAddPlantChoice("skip")}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { marginTop: 16 },
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>I'll do this later</Text>
              </Pressable>
            </View>
          )}

          {item.type === "celebration" && (
            <Animated.View style={[styles.actionContainer, { opacity: confettiAnim }]}>
              {/* Confetti emojis */}
              <View style={styles.confettiContainer}>
                {["🎊", "🌱", "🎉", "🌿", "✨", "🪴"].map((emoji, i) => (
                  <Text key={i} style={[styles.confettiEmoji, { left: `${15 + i * 12}%` }]}>
                    {emoji}
                  </Text>
                ))}
              </View>
              <Pressable
                onPress={handleComplete}
                style={({ pressed }) => [
                  styles.primaryButton,
                  styles.celebrationButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.primaryButtonText}>Let's Grow! 🌱</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>

        {/* Progress dots */}
        <View style={styles.progressContainer}>
          {ONBOARDING_STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i === index && styles.progressDotActive,
                i < index && styles.progressDotCompleted,
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  // If onboarding is already completed, redirect to tabs
  useEffect(() => {
    if (preferences.onboardingCompleted) {
      router.replace("/(tabs)");
    }
  }, [preferences.onboardingCompleted]);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_STEPS}
        renderItem={renderStep}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF9F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#687076",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  actionContainer: {
    width: "100%",
    marginTop: 40,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#A8E063",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#A8E063",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D5A27",
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#687076",
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  quizContainer: {
    width: "100%",
    marginTop: 32,
    gap: 12,
  },
  quizOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8E4DC",
  },
  quizOptionSelected: {
    borderColor: "#A8E063",
    backgroundColor: "#F5FFF0",
  },
  quizEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  quizTextContainer: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 4,
  },
  quizTitleSelected: {
    color: "#2D5A27",
  },
  quizDescription: {
    fontSize: 14,
    color: "#687076",
  },
  addPlantOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8E4DC",
  },
  addPlantEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  addPlantText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E8E4DC",
  },
  progressDotActive: {
    width: 24,
    backgroundColor: "#A8E063",
  },
  progressDotCompleted: {
    backgroundColor: "#A8E063",
  },
  confettiContainer: {
    position: "absolute",
    top: -60,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: "row",
  },
  confettiEmoji: {
    position: "absolute",
    fontSize: 24,
  },
  celebrationButton: {
    backgroundColor: "#FFD93D",
    shadowColor: "#FFD93D",
  },
});
