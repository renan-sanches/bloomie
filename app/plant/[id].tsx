import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { colors, spacing, borderRadius, typography } from "@/components/ui/design-system";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useApp, getPlantStatus, getPersonalityTagline, formatTimeAgo, type Plant, type CareEvent } from "@/lib/store";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CARE_ACTIONS = [
  { type: "water" as const, label: "Water", emoji: "💧", color: colors.accentCyan, bgColor: colors.accentCyan + '15' },
  { type: "mist" as const, label: "Mist", emoji: "💨", color: colors.accentCyan, bgColor: colors.accentCyan + '10' },
  { type: "fertilize" as const, label: "Fertilize", emoji: "🌱", color: colors.accentOrange, bgColor: colors.accentOrange + '15' },
  { type: "rotate" as const, label: "Rotate", emoji: "🔄", color: colors.accentPurple, bgColor: colors.accentPurple + '15' },
];

const PLANT_EMOJIS: Record<string, string> = {
  monstera: "🪴",
  fern: "🌿",
  succulent: "🌵",
  sansevieria: "🌿",
  pothos: "🌱",
  philodendron: "🌿",
  default: "🌱",
};

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plants, tasks, updatePlant, removePlant, completeTask, logCareEvent, addInsight } = useApp();
  const insets = useSafeAreaInsets();

  const plant = plants.find((p) => p.id === id);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(plant?.nickname || "");
  const [showCareModal, setShowCareModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<typeof CARE_ACTIONS[0] | null>(null);
  const [careNote, setCareNote] = useState("");
  const [showDeathModal, setShowDeathModal] = useState(false);
  const [reflection, setReflection] = useState("");
  const [shouldNavigateBack, setShouldNavigateBack] = useState(false);

  const scrollY = useSharedValue(0);

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Handle navigation after plant removal using useEffect
  useEffect(() => {
    if (shouldNavigateBack) {
      router.back();
    }
  }, [shouldNavigateBack]);

  const triggerHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Early return AFTER all hooks are called
  if (!plant) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <View style={styles.notFound}>
          <Text style={styles.notFoundEmoji}>🌱</Text>
          <Text style={styles.notFoundText}>Plant not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const status = getPlantStatus(plant);
  const tagline = getPersonalityTagline(plant);
  const plantEmoji = PLANT_EMOJIS[plant.species.toLowerCase()] || PLANT_EMOJIS.default;

  // Get pending tasks for this plant
  const plantTasks = tasks.filter((t) => t.plantId === plant.id && !t.completed);

  const getNextDueDate = (type: CareEvent["type"]) => {
    const task = plantTasks.find((t) => t.type === type);
    if (!task) return "Not scheduled";
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `In ${diffDays} days`;
  };

  const handleSaveName = async () => {
    triggerHaptic();
    await updatePlant(plant.id, { nickname: editedName });
    setIsEditingName(false);
  };

  const handleCareAction = (action: typeof CARE_ACTIONS[0]) => {
    triggerHaptic();
    setSelectedAction(action);
    setShowCareModal(true);
  };

  const handleCompleteCare = async () => {
    if (!selectedAction) return;
    triggerHaptic();

    // Find and complete the task
    const task = plantTasks.find((t) => t.type === selectedAction.type);
    if (task) {
      await completeTask(task.id);
    }

    // Log the care event
    await logCareEvent(plant.id, selectedAction.type, careNote || undefined);

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setShowCareModal(false);
    setSelectedAction(null);
    setCareNote("");
  };

  const handleMarkAsDead = async () => {
    triggerHaptic();
    setShowDeathModal(true);
  };

  const handleConfirmDeath = async () => {
    triggerHaptic();

    // Create memory insight
    await addInsight({
      plantId: plant.id,
      type: "tip",
      title: `Goodbye, ${plant.nickname}`,
      message: reflection || `You kept ${plant.nickname} alive for ${Math.floor((new Date().getTime() - new Date(plant.dateAdded).getTime()) / (1000 * 60 * 60 * 24))} days. 💚`,
    });

    await removePlant(plant.id);
    setShowDeathModal(false);
    // Use state to trigger navigation in useEffect to avoid navigation during render
    setShouldNavigateBack(true);
  };

  return (
    <ScreenContainer edges={["left", "right"]} containerClassName="bg-background">
      {/* Fixed Header */}
      <Animated.View style={[styles.fixedHeader, { paddingTop: insets.top }, headerAnimatedStyle]}>
        <Pressable onPress={() => { triggerHaptic(); router.back(); }} style={styles.headerBackButton}>
          <IconSymbol name="chevron.left" size={24} color="#2C3E50" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{plant.nickname}</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          scrollY.value = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        {/* Back Button */}
        <Pressable
          onPress={() => { triggerHaptic(); router.back(); }}
          style={styles.backButtonFloat}
        >
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </Pressable>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.plantImageContainer}>
            {plant.photo ? (
              <Image source={{ uri: plant.photo }} style={styles.plantPhoto} contentFit="cover" />
            ) : (
              <Text style={styles.plantEmoji}>{plantEmoji}</Text>
            )}
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Text style={styles.statusText}>{status.message}</Text>
            </View>
          </View>

          {/* Name and Tagline */}
          <View style={styles.nameSection}>
            {isEditingName ? (
              <View style={styles.editNameContainer}>
                <TextInput
                  style={styles.nameInput}
                  value={editedName}
                  onChangeText={setEditedName}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
                />
                <Pressable onPress={handleSaveName} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => { triggerHaptic(); setEditedName(plant.nickname); setIsEditingName(true); }}>
                <Text style={styles.plantName}>{plant.nickname}</Text>
              </Pressable>
            )}
            <Text style={styles.plantSpecies}>{plant.species}</Text>
            <Text style={styles.plantTagline}>"{tagline}"</Text>
          </View>
        </View>

        {/* Health Dashboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Dashboard</Text>
          <View style={styles.healthCard}>
            {/* Health Score Circle */}
            <View style={styles.healthScoreContainer}>
              <View style={styles.healthScoreCircle}>
                <Text style={styles.healthScoreValue}>{plant.healthScore}</Text>
                <Text style={styles.healthScoreLabel}>Health</Text>
              </View>
            </View>

            {/* Stat Bars */}
            <View style={styles.statBars}>
              <View style={styles.statBar}>
                <View style={styles.statBarHeader}>
                  <Text style={styles.statBarLabel}>💧 Hydration</Text>
                  <Text style={styles.statBarValue}>{plant.hydrationLevel}%</Text>
                </View>
                <View style={styles.statBarTrack}>
                  <View style={[styles.statBarFill, styles.hydrationFill, { width: `${plant.hydrationLevel ?? 0}%` }]} />
                </View>
              </View>
              <View style={styles.statBar}>
                <View style={styles.statBarHeader}>
                  <Text style={styles.statBarLabel}>☀️ Light</Text>
                  <Text style={styles.statBarValue}>{plant.lightExposure}%</Text>
                </View>
                <View style={styles.statBarTrack}>
                  <View style={[styles.statBarFill, styles.lightFill, { width: `${plant.lightExposure ?? 0}%` }]} />
                </View>
              </View>
              <View style={styles.statBar}>
                <View style={styles.statBarHeader}>
                  <Text style={styles.statBarLabel}>💨 Humidity</Text>
                  <Text style={styles.statBarValue}>{plant.humidityLevel}%</Text>
                </View>
                <View style={styles.statBarTrack}>
                  <View style={[styles.statBarFill, styles.humidityFill, { width: `${plant.humidityLevel ?? 0}%` }]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Care Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Actions</Text>
          <View style={styles.careActions}>
            {CARE_ACTIONS.map((action) => (
              <Pressable
                key={action.type}
                onPress={() => handleCareAction(action)}
                style={({ pressed }) => [
                  styles.careActionButton,
                  { backgroundColor: action.bgColor },
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.careActionEmoji}>{action.emoji}</Text>
                <Text style={[styles.careActionLabel, { color: action.color }]}>{action.label}</Text>
                <Text style={styles.careActionDue}>{getNextDueDate(action.type)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Care History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Care</Text>
          {plant.careHistory.length > 0 ? (
            <View style={styles.historyList}>
              {plant.careHistory.slice(-5).reverse().map((event) => (
                <View key={event.id} style={styles.historyItem}>
                  <Text style={styles.historyEmoji}>
                    {CARE_ACTIONS.find((a) => a.type === event.type)?.emoji || "🌱"}
                  </Text>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyType}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Text>
                    <Text style={styles.historyDate}>{formatTimeAgo(event.date)}</Text>
                  </View>
                  {event.note && <Text style={styles.historyNote} numberOfLines={1}>{event.note}</Text>}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryText}>No care logged yet</Text>
            </View>
          )}
        </View>

        {/* Care Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipEmoji}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Water when top inch is dry</Text>
              <Text style={styles.tipText}>
                Check the soil moisture by sticking your finger about an inch deep. If it feels dry, it's time to water!
              </Text>
            </View>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipEmoji}>☀️</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Bright indirect light</Text>
              <Text style={styles.tipText}>
                Place near a window with filtered light. Avoid direct sunlight which can burn the leaves.
              </Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Pressable
            onPress={handleMarkAsDead}
            style={({ pressed }) => [styles.dangerButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.dangerButtonText}>Say Goodbye to {plant.nickname}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Care Action Modal */}
      <Modal
        visible={showCareModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowCareModal(false)}>
                <IconSymbol name="xmark" size={24} color="#687076" />
              </Pressable>
              <Text style={styles.modalTitle}>Log {selectedAction?.label}</Text>
              <View style={{ width: 24 }} />
            </View>

            {selectedAction && (
              <View style={styles.modalBody}>
                <View style={[styles.modalActionIcon, { backgroundColor: selectedAction.bgColor }]}>
                  <Text style={styles.modalActionEmoji}>{selectedAction.emoji}</Text>
                </View>
                <Text style={styles.modalActionText}>
                  {selectedAction.label} {plant.nickname}
                </Text>

                <TextInput
                  style={styles.noteInput}
                  placeholder="Add a note (optional)"
                  placeholderTextColor="#9BA1A6"
                  value={careNote}
                  onChangeText={setCareNote}
                  multiline
                  numberOfLines={3}
                />

                <Pressable
                  onPress={handleCompleteCare}
                  style={({ pressed }) => [
                    styles.completeButton,
                    { backgroundColor: selectedAction.color },
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.completeButtonText}>Done! ✓</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Death Modal */}
      <Modal
        visible={showDeathModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeathModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deathModalContent}>
            <Text style={styles.deathEmoji}>🌿</Text>
            <Text style={styles.deathTitle}>Say goodbye to {plant.nickname}</Text>
            <Text style={styles.deathSubtitle}>
              You kept {plant.nickname} alive for {Math.floor((new Date().getTime() - new Date(plant.dateAdded).getTime()) / (1000 * 60 * 60 * 24))} days 💚
            </Text>

            <TextInput
              style={styles.reflectionInput}
              placeholder="What did you learn from this plant? (optional)"
              placeholderTextColor="#9BA1A6"
              value={reflection}
              onChangeText={setReflection}
              multiline
              numberOfLines={3}
            />

            <View style={styles.deathActions}>
              <Pressable
                onPress={() => setShowDeathModal(false)}
                style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.cancelButtonText}>Keep {plant.nickname}</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmDeath}
                style={({ pressed }) => [styles.confirmDeathButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.confirmDeathText}>Archive</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: 12,
    backgroundColor: colors.surfaceLight,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
  },
  backButtonFloat: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: colors.primaryLight + '20',
  },
  plantImageContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  plantPhoto: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  plantEmoji: {
    fontSize: 72,
  },
  statusBadge: {
    position: "absolute",
    bottom: -8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.surfaceLight,
  },
  nameSection: {
    alignItems: "center",
  },
  plantName: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
    marginBottom: 4,
  },
  editNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  nameInput: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingVertical: 4,
    minWidth: 150,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  saveButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.surfaceLight,
  },
  plantSpecies: {
    fontSize: typography.fontSize.base,
    color: colors.gray600,
    marginBottom: 8,
  },
  plantTagline: {
    fontSize: typography.fontSize.sm,
    fontStyle: "italic",
    color: colors.gray500,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
    marginBottom: 12,
  },
  healthCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.xl,
    padding: 20,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  healthScoreContainer: {
    marginRight: 20,
  },
  healthScoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight + '20',
    borderWidth: 6,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  healthScoreValue: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  healthScoreLabel: {
    fontSize: 12,
    color: colors.gray600,
  },
  statBars: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
  },
  statBar: {},
  statBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  statBarLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray600,
  },
  statBarValue: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
  },
  statBarTrack: {
    height: 8,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  statBarFill: {
    height: "100%",
    borderRadius: borderRadius.full,
  },
  hydrationFill: {
    backgroundColor: colors.accentCyan,
  },
  lightFill: {
    backgroundColor: colors.accentOrange,
  },
  humidityFill: {
    backgroundColor: colors.accentCyan,
  },
  careActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  careActionButton: {
    width: "47%",
    padding: 16,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  careActionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  careActionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 4,
  },
  careActionDue: {
    fontSize: 12,
    color: colors.gray500,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  historyList: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  historyEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyType: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
  },
  historyDate: {
    fontSize: 12,
    color: colors.gray500,
  },
  historyNote: {
    fontSize: 12,
    color: colors.gray600,
    maxWidth: 100,
  },
  emptyHistory: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
    padding: 24,
    alignItems: "center",
  },
  emptyHistoryText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray400,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  tipEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: colors.gray600,
    lineHeight: 18,
  },
  dangerSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: 32,
  },
  dangerButton: {
    backgroundColor: colors.gray50,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  dangerButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: '#FF6B6B',
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  notFoundText: {
    fontSize: 18,
    color: "#687076",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#A8E063",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D5A27",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E4DC",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
  },
  modalBody: {
    padding: 24,
    alignItems: "center",
  },
  modalActionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalActionEmoji: {
    fontSize: 40,
  },
  modalActionText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 24,
  },
  noteInput: {
    width: "100%",
    backgroundColor: "#F5F5F0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#2C3E50",
    marginBottom: 24,
    minHeight: 80,
    textAlignVertical: "top",
  },
  completeButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  deathModalContent: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  deathEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  deathTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 8,
    textAlign: "center",
  },
  deathSubtitle: {
    fontSize: 15,
    color: "#687076",
    textAlign: "center",
    marginBottom: 20,
  },
  reflectionInput: {
    width: "100%",
    backgroundColor: "#F5F5F0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#2C3E50",
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: "top",
  },
  deathActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F5F5F0",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#687076",
  },
  confirmDeathButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#FF6B6B",
  },
  confirmDeathText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
