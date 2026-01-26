import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  Platform,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { colors } from "@/components/ui/design-system";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useApp, formatTimeAgo, type CareEvent } from "@/lib/store";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CARE_ACTIONS = [
  { type: "water" as const, label: "Water", emoji: "drop.fill" as const, color: "#f59e0b", freq: "Every 7 days" },
  { type: "mist" as const, label: "Mist", emoji: "cloud.rain.fill" as const, color: "#06b6d4", freq: "Every 3 days" },
  { type: "fertilize" as const, label: "Fertilize", emoji: "leaf.fill" as const, color: "#10b981", freq: "Every 30 days" },
];

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plants, tasks, completeTask, logCare } = useApp();
  const insets = useSafeAreaInsets();

  const plant = plants.find((p) => p.id === id);
  const [showCareModal, setShowCareModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<typeof CARE_ACTIONS[0] | null>(null);
  const [careNote, setCareNote] = useState("");

  if (!plant) return null;

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

  const triggerHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleCareAction = (action: typeof CARE_ACTIONS[0]) => {
    triggerHaptic();
    setSelectedAction(action);
    setShowCareModal(true);
  };

  const handleCompleteCare = async () => {
    if (!selectedAction) return;
    triggerHaptic();

    const task = plantTasks.find((t) => t.type === selectedAction.type);
    if (task) {
      await completeTask(task.id);
    }

    await logCare(plant.id, selectedAction.type, careNote || undefined);

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setShowCareModal(false);
    setSelectedAction(null);
    setCareNote("");
  };

  return (
    <ScreenContainer edges={["left", "right"]} containerClassName="bg-[#fff]">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Breadcrumb Navigation */}
        <View style={styles.navRow}>
          <Pressable onPress={() => router.back()} style={styles.navBack}>
            <IconSymbol name="house.fill" size={16} color="#94a3b8" />
            <Text style={styles.navText}>My Garden</Text>
          </Pressable>
          <Text style={styles.navSeparator}>/</Text>
          <Text style={styles.navCurrent}>{plant.nickname}</Text>
        </View>

        <View style={styles.mainLayout}>
          {/* Left Column: Image & Basic Info */}
          <View style={styles.leftColumn}>
            <View style={styles.heroCard}>
              <View style={styles.imageBox}>
                <Image
                  source={{ uri: plant.photo || plant.photos?.[0]?.uri }}
                  style={styles.plantImage}
                  contentFit="cover"
                />
                <View style={styles.ageBadge}>
                  <IconSymbol name="drop.fill" size={10} color="#f59e0b" />
                  <Text style={styles.ageText}>2 days ago</Text>
                </View>
              </View>

              <View style={styles.basicInfo}>
                <Text style={styles.plantTitle}>{plant.nickname}</Text>
                <Text style={styles.plantSubtitle}>{plant.scientificName || plant.species}</Text>

                <View style={styles.tagRow}>
                  <View style={styles.tag}>
                    <IconSymbol name="speedometer" size={12} color="#06b6d4" />
                    <Text style={styles.tagText}>Difficulty: Med</Text>
                  </View>
                  <View style={styles.tag}>
                    <IconSymbol name="pawprint.fill" size={12} color="#f43f5e" />
                    <Text style={styles.tagText}>Toxic to Pets</Text>
                  </View>
                </View>

                <Pressable style={styles.editProfileButton}>
                  <IconSymbol name="pencil" size={14} color="#1e293b" />
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </Pressable>
              </View>
            </View>

            {/* Pro Tip Box */}
            <View style={styles.proTipBox}>
              <View style={styles.proTipIcon}>
                <IconSymbol name="lightbulb.fill" size={20} color="#f59e0b" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.proTipTitle}>Pro Tip</Text>
                <Text style={styles.proTipText}>
                  Rotate your {plant.nickname} every time you water it to ensure even growth towards the sunlight.
                </Text>
              </View>
            </View>
          </View>

          {/* Right Column: Care, Environment, Health, Notes */}
          <View style={styles.rightColumn}>
            {/* Care Schedule */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleGroup}>
                  <IconSymbol name="calendar" size={20} color="#f59e0b" />
                  <Text style={styles.sectionTitle}>Care Schedule</Text>
                </View>
                <Pressable>
                  <Text style={styles.viewLink}>View Calendar</Text>
                </Pressable>
              </View>

              <View style={styles.careGrid}>
                {CARE_ACTIONS.map((action) => (
                  <View key={action.type} style={styles.careCard}>
                    <View style={styles.careCardTop}>
                      <View style={[styles.careIconCircle, { backgroundColor: action.color + '10' }]}>
                        <IconSymbol name={action.emoji} size={18} color={action.color} />
                      </View>
                      <View style={[styles.freqBadge, { backgroundColor: action.color + '10' }]}>
                        <Text style={[styles.freqText, { color: action.color }]}>{action.freq}</Text>
                      </View>
                    </View>

                    <View style={styles.careCardMiddle}>
                      <Text style={styles.careActionName}>{action.label}</Text>
                      <Text style={styles.careActionDue}>
                        Next due: <Text style={{ color: action.color, fontWeight: '700' }}>{getNextDueDate(action.type)}</Text>
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => handleCareAction(action)}
                      style={styles.markDoneButton}
                    >
                      <IconSymbol name="checkmark" size={14} color={action.color} />
                      <Text style={[styles.markDoneText, { color: action.color }]}>Mark Done</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>

            {/* Environment */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleGroup}>
                  <IconSymbol name="sun.max.fill" size={20} color="#f59e0b" />
                  <Text style={styles.sectionTitle}>Environment</Text>
                </View>
              </View>

              <View style={styles.envCard}>
                <View style={styles.envHeader}>
                  <Text style={styles.envLabel}>LIGHT REQUIREMENT</Text>
                  <View style={styles.envValueBadge}>
                    <Text style={styles.envActiveValue}>Bright Indirect</Text>
                  </View>
                </View>

                <View style={styles.sliderTrack}>
                  <View style={styles.sliderThumb} />
                </View>

                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>Low Light</Text>
                  <Text style={styles.sliderLabel}>Medium</Text>
                  <Text style={[styles.sliderLabel, { color: '#6366f1', fontWeight: '800' }]}>Bright Indirect</Text>
                  <Text style={styles.sliderLabel}>Direct Sun</Text>
                </View>

                <View style={styles.envStats}>
                  <View style={styles.statBox}>
                    <View style={styles.statIconCircle}>
                      <IconSymbol name="thermometer" size={18} color="#6366f1" />
                    </View>
                    <View>
                      <Text style={styles.statLabel}>TEMP</Text>
                      <Text style={styles.statValue}>65°F - 85°F</Text>
                    </View>
                  </View>
                  <View style={styles.statBox}>
                    <View style={styles.statIconCircle}>
                      <IconSymbol name="cloud.fill" size={18} color="#6366f1" />
                    </View>
                    <View>
                      <Text style={styles.statLabel}>HUMIDITY</Text>
                      <Text style={styles.statValue}>High (60%+)</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Health & Notes Parallel */}
            <View style={styles.parallelRow}>
              <View style={[styles.section, { flex: 1 }]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleGroup}>
                    <IconSymbol name="heart.fill" size={20} color="#6366f1" />
                    <Text style={styles.sectionTitle}>Health Status</Text>
                  </View>
                </View>
                <View style={styles.healthCard}>
                  <View style={styles.healthOverview}>
                    <View style={styles.healthCircle}>
                      <Text style={styles.healthPercent}>92%</Text>
                    </View>
                    <View>
                      <Text style={styles.healthMainText}>Thriving!</Text>
                      <Text style={styles.healthSubText}>Last checked: 3 days ago</Text>
                      <View style={styles.healthBadge}>
                        <Text style={styles.healthBadgeText}>OPTIMAL HEALTH</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.healthLogList}>
                    <View style={styles.healthLogEntry}>
                      <IconSymbol name="checkmark.circle.fill" size={14} color="#6366f1" />
                      <Text style={styles.healthLogText}>New leaf growth spotted on top branch.</Text>
                    </View>
                    <View style={styles.healthLogEntryGray}>
                      <IconSymbol name="clock" size={14} color="#94a3b8" />
                      <Text style={styles.healthLogText}>Leaves dusted and cleaned.</Text>
                    </View>
                  </View>
                  <Pressable style={styles.addLogBtn}>
                    <IconSymbol name="plus" size={14} color="#94a3b8" />
                    <Text style={styles.addLogBtnText}>Add Health Log</Text>
                  </Pressable>
                </View>
              </View>

              <View style={[styles.section, { flex: 1 }]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleGroup}>
                    <IconSymbol name="book.fill" size={20} color="#10b981" />
                    <Text style={styles.sectionTitle}>Notes</Text>
                  </View>
                </View>
                <View style={styles.notesCard}>
                  <Text style={styles.notesBody}>
                    My Fiddle Leaf seems to prefer the corner spot near the east-facing window. It dropped two leaves last winter when moved near the heater.{"\n\n"}
                    Currently using the 10-10-10 fertilizer mix during growing season.
                  </Text>
                  <View style={styles.notesFooter}>
                    <Text style={styles.lastEditedText}>LAST EDITED: OCT 24</Text>
                    <Pressable>
                      <Text style={styles.editNotesBtn}>Edit Notes</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Care Log Modal */}
      <Modal visible={showCareModal} transparent animationType="slide" onRequestClose={() => setShowCareModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log {selectedAction?.label}</Text>
              <Pressable onPress={() => setShowCareModal(false)}>
                <IconSymbol name="xmark" size={24} color="#64748b" />
              </Pressable>
            </View>
            {selectedAction && (
              <View style={styles.modalBody}>
                <View style={[styles.modalIcon, { backgroundColor: selectedAction.color + '15' }]}>
                  <IconSymbol name={selectedAction.emoji} size={48} color={selectedAction.color} />
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
  scrollContent: {
    paddingBottom: 40,
    maxWidth: 1400,
    width: '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: 32,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  navBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#64748b',
  },
  navSeparator: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  navCurrent: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#10b981',
  },
  mainLayout: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 32,
  },
  leftColumn: {
    flex: 1,
    gap: 24,
  },
  rightColumn: {
    flex: 2,
    gap: 32,
  },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f8fafc',
  },
  imageBox: {
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    marginBottom: 24,
  },
  plantImage: {
    width: '100%',
    height: '100%',
  },
  ageBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  ageText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  basicInfo: {
    gap: 4,
  },
  plantTitle: {
    fontSize: 36,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  plantSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#64748b',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  proTipBox: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#fffbeb',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  proTipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proTipTitle: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#f59e0b',
    marginBottom: 4,
  },
  proTipText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#92400e',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  section: {
    gap: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  viewLink: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#10b981',
  },
  careGrid: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  careCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 16,
  },
  careCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  careIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freqBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  freqText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
  },
  careCardMiddle: {
    gap: 4,
  },
  careActionName: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  careActionDue: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  markDoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  markDoneText: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
  },
  envCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  envHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  envLabel: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  envValueBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  envActiveValue: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#6366f1',
  },
  sliderTrack: {
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff7ed', // Light orange gradient feel
    overflow: 'visible',
    marginVertical: 12,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    left: '75%',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 6,
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 12,
    marginBottom: 40,
  },
  sliderLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#94a3b8',
  },
  envStats: {
    flexDirection: 'row',
    gap: 48,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#94a3b8',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  parallelRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 32,
  },
  healthCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 24,
  },
  healthOverview: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  healthCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthPercent: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  healthMainText: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  healthSubText: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Medium',
    marginBottom: 8,
  },
  healthBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  healthBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#6366f1',
  },
  healthLogList: {
    gap: 12,
  },
  healthLogEntry: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  healthLogEntryGray: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
  },
  healthLogText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
    fontFamily: 'PlusJakartaSans-Medium',
    flex: 1,
  },
  addLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  addLogBtnText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#94a3b8',
  },
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    flex: 1,
    justifyContent: 'space-between',
  },
  notesBody: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  notesFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 24,
  },
  lastEditedText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#94a3b8',
  },
  editNotesBtn: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#10b981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 32,
    width: '100%',
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  modalBody: {
    alignItems: 'center',
    gap: 24,
  },
  modalIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Medium',
    // @ts-ignore
    outlineStyle: 'none',
  },
  modalButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
  },
} as any);
