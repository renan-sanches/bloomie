import { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { colors as systemColors, spacing, borderRadius, typography } from "@/components/ui/design-system";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useApp, getPlantStatus, getPersonalityTagline, formatTimeAgo, type Plant, type CareEvent } from "@/lib/store";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { PhotoComparisonSlider } from "@/components/photo-comparison-slider";
import { trpc } from "@/lib/trpc";
import { uriToBase64 } from "@/lib/image-utils";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Custom colors from design
const theme = {
  primary: "#5b8069",
  primaryDark: "#3d5c48",
  accentOrange: "#f9b233",
  accentPurple: "#6366f1",
  accentRed: "#f0515b",
  backgroundLight: "#f8f7f7",
  surfaceLight: "#ffffff",
  textMain: "#111827",
  textSub: "#6b7280",
};

const CARE_ACTIONS = [
  { type: "water" as const, label: "Water", emoji: "water.drop.fill" as const, color: theme.accentOrange, freq: "Every 7 days" },
  { type: "mist" as const, label: "Mist", emoji: "cloud.fill" as const, color: theme.accentPurple, freq: "Every 3 days" },
  { type: "fertilize" as const, label: "Fertilize", emoji: "leaf.fill" as const, color: theme.primary, freq: "Every 30 days" },
];

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plants, tasks, updatePlant, deletePlant, completeTask, logCare, addInsight } = useApp();
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
  const [isAnalyzingGrowth, setIsAnalyzingGrowth] = useState(false);
  const [growthInsight, setGrowthInsight] = useState<{ insight: string; growthDetected: boolean } | null>(null);

  const analyzeGrowthMutation = trpc.ai.analyzeGrowthProgress.useMutation();
  const scrollY = useSharedValue(0);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

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

  if (!plant) return null;

  // Get pending tasks for this plant
  const plantTasks = useMemo(() => {
    return tasks.filter((t) => t.plantId === plant.id && !t.completed);
  }, [tasks, plant.id]);

  const getNextDueDate = (type: CareEvent["type"]) => {
    const task = plantTasks.find((t) => t.type === type);
    if (!task) return "Scheduled";
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `In ${diffDays} days`;
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
    await logCare(plant.id, selectedAction.type, careNote || undefined);

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setShowCareModal(false);
    setSelectedAction(null);
    setCareNote("");
  };

  const handleAnalyzeGrowth = async () => {
    if (!plant.photos || plant.photos.length < 2) return;
    triggerHaptic();
    setIsAnalyzingGrowth(true);
    setGrowthInsight(null);

    try {
      const beforePhoto = plant.photos[0];
      const afterPhoto = plant.photos[plant.photos.length - 1];
      const beforeBase64 = await uriToBase64(beforePhoto.uri);
      const afterBase64 = await uriToBase64(afterPhoto.uri);

      if (beforeBase64 && afterBase64) {
        const result = await analyzeGrowthMutation.mutateAsync({
          beforeImageBase64: beforeBase64,
          afterImageBase64: afterBase64,
          plantName: plant.nickname,
        });
        setGrowthInsight(result);
      }
    } catch (error) {
      console.error("Growth analysis error:", error);
    } finally {
      setIsAnalyzingGrowth(false);
    }
  };

  return (
    <ScreenContainer edges={["left", "right"]} containerClassName="bg-background">
      {/* Fixed Header */}
      <Animated.View style={[styles.fixedHeader, { paddingTop: insets.top }, headerAnimatedStyle]}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <IconSymbol name="chevron.left" size={24} color={theme.textMain} />
        </Pressable>
        <Text style={styles.fixedHeaderTitle}>{plant.nickname}</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => { scrollY.value = e.nativeEvent.contentOffset.y; }}
        scrollEventThrottle={16}
      >
        {/* Navigation Row */}
        <View style={styles.navRow}>
          <Pressable onPress={() => router.back()} style={styles.navBack}>
            <IconSymbol name="chevron.left" size={20} color={theme.textSub} />
            <Text style={styles.navText}>My Garden</Text>
          </Pressable>
          <Text style={styles.navTextSub}>/</Text>
          <Text style={[styles.navText, { color: theme.primary }]}>{plant.nickname}</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: plant.photo || plant.photos?.[0]?.uri }}
              style={styles.heroImage}
              contentFit="cover"
            />
            <View style={styles.lastWateredBadge}>
              <IconSymbol name="drop.fill" size={12} color={theme.accentOrange} />
              <Text style={styles.lastWateredText}>
                {plant.lastWatered ? formatTimeAgo(plant.lastWatered) : 'Needs water'}
              </Text>
            </View>
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.heroTitle}>{plant.nickname}</Text>
            <Text style={styles.heroSubtitle}>{plant.scientificName || plant.species}</Text>
            
            <View style={styles.pillsRow}>
              <View style={styles.pill}>
                <IconSymbol name="speedometer" size={14} color={theme.accentPurple} />
                <Text style={styles.pillText}>Diff: Med</Text>
              </View>
              <View style={styles.pill}>
                <IconSymbol name="pawprint.fill" size={14} color={theme.accentRed} />
                <Text style={styles.pillText}>Toxic to Pets</Text>
              </View>
            </View>

            <Pressable style={styles.editButton}>
              <IconSymbol name="pencil" size={16} color={theme.textMain} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </Pressable>
          </View>

          {/* Pro Tip */}
          <View style={styles.proTipBox}>
            <IconSymbol name="lightbulb.fill" size={24} color={theme.accentOrange} />
            <View style={{ flex: 1 }}>
              <Text style={styles.proTipTitle}>Pro Tip</Text>
              <Text style={styles.proTipText}>
                Rotate your {plant.nickname} every time you water it to ensure even growth towards the sunlight.
              </Text>
            </View>
          </View>
        </View>

        {/* Care Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <IconSymbol name="calendar" size={24} color={theme.accentOrange} />
              <Text style={styles.sectionTitle}>Care Schedule</Text>
            </View>
            <Text style={styles.viewCalendarText}>View Calendar</Text>
          </View>

          <View style={styles.careGrid}>
            {CARE_ACTIONS.map((action) => (
              <View key={action.type} style={styles.careCard}>
                <View style={styles.careCardHeader}>
                  <View style={[styles.careIcon, { backgroundColor: action.color + '20' }]}>
                    <IconSymbol name={action.emoji} size={20} color={action.color} />
                  </View>
                  <View style={[styles.freqBadge, { backgroundColor: action.color + '10' }]}>
                    <Text style={[styles.freqText, { color: action.color }]}>{action.freq}</Text>
                  </View>
                </View>
                
                <View style={styles.careCardBody}>
                  <Text style={styles.careTitle}>{action.label}</Text>
                  <Text style={styles.careSubtitle}>
                    Next due: <Text style={{ color: action.color, fontWeight: '700' }}>{getNextDueDate(action.type)}</Text>
                  </Text>
                  <Pressable
                    onPress={() => handleCareAction(action)}
                    style={({ pressed }) => [
                      styles.markDoneButton,
                      { backgroundColor: pressed ? action.color + '20' : theme.surfaceLight, borderColor: action.color }
                    ]}
                  >
                    <IconSymbol name="checkmark" size={16} color={action.color} />
                    <Text style={[styles.markDoneText, { color: action.color }]}>Mark Done</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Environment */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <IconSymbol name="sun.max.fill" size={24} color={theme.accentOrange} />
            <Text style={styles.sectionTitle}>Environment</Text>
          </View>
          
          <View style={styles.envCard}>
            <View style={styles.envHeader}>
              <Text style={styles.envLabel}>LIGHT REQUIREMENT</Text>
              <View style={styles.envBadge}>
                <Text style={styles.envBadgeText}>Bright Indirect</Text>
              </View>
            </View>
            
            <View style={styles.gradientBar}>
              <View style={styles.gradientIndicator} />
            </View>
            
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleText}>Low</Text>
              <Text style={styles.scaleText}>Medium</Text>
              <Text style={[styles.scaleText, { color: theme.accentPurple, fontWeight: '700' }]}>Bright Indirect</Text>
              <Text style={styles.scaleText}>Direct</Text>
            </View>

            <View style={styles.envStats}>
              <View style={styles.envStatItem}>
                <View style={styles.envStatIcon}>
                  <IconSymbol name="thermometer" size={20} color={theme.accentPurple} />
                </View>
                <View>
                  <Text style={styles.envStatLabel}>TEMP</Text>
                  <Text style={styles.envStatValue}>65°F - 85°F</Text>
                </View>
              </View>
              
              <View style={styles.envStatItem}>
                <View style={styles.envStatIcon}>
                  <IconSymbol name="cloud.fill" size={20} color={theme.accentPurple} />
                </View>
                <View>
                  <Text style={styles.envStatLabel}>HUMIDITY</Text>
                  <Text style={styles.envStatValue}>High (60%+)</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Health Status */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <IconSymbol name="heart.fill" size={24} color={theme.accentPurple} />
            <Text style={styles.sectionTitle}>Health Status</Text>
          </View>

          <View style={styles.healthCard}>
            <View style={styles.healthMain}>
              <View style={styles.healthCircle}>
                <Text style={styles.healthScore}>{plant.healthScore}%</Text>
              </View>
              <View>
                <Text style={styles.healthStatusTitle}>Thriving!</Text>
                <Text style={styles.healthStatusSub}>Last checked: 3 days ago</Text>
                <View style={styles.healthBadge}>
                  <Text style={styles.healthBadgeText}>OPTIMAL HEALTH</Text>
                </View>
              </View>
            </View>

            <View style={styles.healthLogs}>
              <View style={styles.logItem}>
                <IconSymbol name="checkmark.circle.fill" size={16} color={theme.accentPurple} />
                <Text style={styles.logText}>New leaf growth spotted on top branch.</Text>
              </View>
              <View style={[styles.logItem, { borderLeftColor: 'transparent', backgroundColor: theme.backgroundLight }]}>
                <IconSymbol name="clock" size={16} color={theme.textSub} />
                <Text style={styles.logText}>Leaves dusted and cleaned.</Text>
              </View>
            </View>

            <Pressable style={styles.addLogButton}>
              <IconSymbol name="plus" size={18} color={theme.textSub} />
              <Text style={styles.addLogText}>Add Health Log</Text>
            </Pressable>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <IconSymbol name="book.fill" size={24} color={theme.primary} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>
              {plant.notes && plant.notes.length > 0 
                ? plant.notes.join("\n\n") 
                : `My ${plant.nickname} seems to prefer the corner spot near the east-facing window.`}
            </Text>
            <View style={styles.notesFooter}>
              <Text style={styles.lastEdited}>LAST EDITED: OCT 24</Text>
              <Text style={styles.editNotesText}>Edit Notes</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modals */}
      <Modal visible={showCareModal} transparent animationType="slide" onRequestClose={() => setShowCareModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log {selectedAction?.label}</Text>
              <Pressable onPress={() => setShowCareModal(false)}>
                <IconSymbol name="xmark" size={24} color={theme.textSub} />
              </Pressable>
            </View>
            {selectedAction && (
              <View style={styles.modalBody}>
                <View style={[styles.modalIcon, { backgroundColor: selectedAction.color + '20' }]}>
                  <IconSymbol name={selectedAction.emoji} size={40} color={selectedAction.color} />
                </View>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Add a note (optional)"
                  value={careNote}
                  onChangeText={setCareNote}
                  multiline
                />
                <Pressable onPress={handleCompleteCare} style={[styles.modalButton, { backgroundColor: selectedAction.color }]}>
                  <Text style={styles.modalButtonText}>Mark as Done</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: theme.backgroundLight, flex: 1 },
  fixedHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    backgroundColor: theme.surfaceLight, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12
  },
  headerButton: { padding: 8 },
  fixedHeaderTitle: { fontSize: 16, fontWeight: '700', color: theme.textMain },
  scrollContent: { paddingBottom: 40 },
  
  navRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
  navBack: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  navText: { fontSize: 14, fontWeight: '600', color: theme.textSub },
  navTextSub: { fontSize: 14, color: theme.textSub },

  heroCard: { marginHorizontal: 20, backgroundColor: theme.surfaceLight, borderRadius: 24, padding: 24, shadowColor: theme.primary, shadowOpacity: 0.05, shadowRadius: 20, shadowOffset: {width:0, height: 10} },
  imageContainer: { width: '100%', aspectRatio: 4/5, borderRadius: 16, overflow: 'hidden', marginBottom: 24, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  lastWateredBadge: { 
    position: 'absolute', top: 16, right: 16, 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4
  },
  lastWateredText: { fontSize: 12, fontWeight: '700', color: theme.textMain },
  
  heroInfo: { gap: 4 },
  heroTitle: { fontSize: 32, fontWeight: '800', color: theme.textMain, letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 18, fontWeight: '600', color: theme.primary, fontStyle: 'italic', marginBottom: 16 },
  
  pillsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: theme.backgroundLight, borderWidth: 1, borderColor: '#f0f0f0' },
  pillText: { fontSize: 12, fontWeight: '600', color: theme.textSub },
  
  editButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: theme.surfaceLight },
  editButtonText: { fontSize: 14, fontWeight: '700', color: theme.textMain },
  
  proTipBox: { marginTop: 24, padding: 20, backgroundColor: 'rgba(249, 178, 51, 0.1)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(249, 178, 51, 0.2)', flexDirection: 'row', gap: 16 },
  proTipTitle: { fontSize: 14, fontWeight: '800', color: theme.accentOrange, marginBottom: 4 },
  proTipText: { fontSize: 14, color: theme.textSub, lineHeight: 20 },

  section: { marginTop: 32, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  sectionTitle: { fontSize: 24, fontWeight: '700', color: theme.textMain, letterSpacing: -0.5 },
  viewCalendarText: { fontSize: 14, fontWeight: '700', color: theme.primary },

  careGrid: { flexDirection: 'column', gap: 16 },
  careCard: { backgroundColor: theme.surfaceLight, padding: 20, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, shadowOffset: {width:0, height: 4}, borderWidth: 1, borderColor: '#f0f0f0' },
  careCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  careIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  freqBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  freqText: { fontSize: 12, fontWeight: '700' },
  careCardBody: {},
  careTitle: { fontSize: 18, fontWeight: '700', color: theme.textMain, marginBottom: 4 },
  careSubtitle: { fontSize: 14, color: theme.textSub, marginBottom: 16 },
  markDoneButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  markDoneText: { fontSize: 14, fontWeight: '700' },

  envCard: { backgroundColor: theme.surfaceLight, padding: 24, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10 },
  envHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  envLabel: { fontSize: 12, fontWeight: '800', color: theme.textSub, letterSpacing: 0.5 },
  envBadge: { backgroundColor: 'rgba(99, 102, 241, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  envBadgeText: { color: theme.accentPurple, fontSize: 12, fontWeight: '700' },
  gradientBar: { height: 16, borderRadius: 8, backgroundColor: '#e5e7eb', overflow: 'hidden', marginBottom: 8, marginTop: 8 },
  gradientIndicator: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.surfaceLight, borderWidth: 4, borderColor: theme.accentPurple, position: 'absolute', top: -4, left: '70%' },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  scaleText: { fontSize: 10, fontWeight: '600', color: theme.textSub },
  envStats: { flexDirection: 'row', gap: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  envStatItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  envStatIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.backgroundLight, alignItems: 'center', justifyContent: 'center' },
  envStatLabel: { fontSize: 10, fontWeight: '800', color: theme.textSub },
  envStatValue: { fontSize: 14, fontWeight: '700', color: theme.textMain },

  healthCard: { backgroundColor: theme.surfaceLight, padding: 24, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10 },
  healthMain: { flexDirection: 'row', gap: 20, marginBottom: 24 },
  healthCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 6, borderColor: theme.accentPurple, alignItems: 'center', justifyContent: 'center' },
  healthScore: { fontSize: 20, fontWeight: '800', color: theme.textMain },
  healthStatusTitle: { fontSize: 18, fontWeight: '800', color: theme.textMain },
  healthStatusSub: { fontSize: 14, color: theme.textSub, marginBottom: 8 },
  healthBadge: { backgroundColor: 'rgba(99, 102, 241, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, alignSelf: 'flex-start' },
  healthBadgeText: { fontSize: 10, fontWeight: '800', color: theme.accentPurple },
  healthLogs: { gap: 12 },
  logItem: { flexDirection: 'row', gap: 12, padding: 12, backgroundColor: theme.backgroundLight, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: theme.accentPurple },
  logText: { fontSize: 14, color: theme.textSub, flex: 1 },
  addLogButton: { marginTop: 24, paddingVertical: 12, borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed', borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  addLogText: { fontSize: 14, fontWeight: '600', color: theme.textSub },

  notesCard: { backgroundColor: theme.surfaceLight, padding: 24, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10 },
  notesText: { fontSize: 14, color: theme.textSub, lineHeight: 22, marginBottom: 16 },
  notesFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  lastEdited: { fontSize: 10, fontWeight: '800', color: theme.textSub },
  editNotesText: { fontSize: 14, fontWeight: '700', color: theme.primary },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.surfaceLight, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.textMain },
  modalBody: { alignItems: 'center', gap: 20 },
  modalIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  modalInput: { width: '100%', backgroundColor: theme.backgroundLight, borderRadius: 12, padding: 16, minHeight: 100, textAlignVertical: 'top' },
  modalButton: { width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
