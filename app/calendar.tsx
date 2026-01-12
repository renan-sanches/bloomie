import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { colors, spacing, borderRadius, typography } from "@/components/ui/design-system";
import { useApp, formatTimeAgo, type CareTask, type Plant } from "@/lib/store";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const TASK_COLORS: Record<string, { bg: string; icon: string; text: string }> = {
  water: { bg: colors.accentCyan + '20', icon: "💧", text: colors.accentCyan },
  mist: { bg: colors.accentCyan + '10', icon: "💨", text: colors.accentCyan },
  fertilize: { bg: colors.accentOrange + '20', icon: "🌱", text: colors.accentOrange },
  rotate: { bg: colors.accentPurple + '20', icon: "🔄", text: colors.accentPurple },
};

export default function CalendarScreen() {
  const { plants, tasks, profile, completeTask, snoozeTask, refreshData } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "quest">("quest");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const triggerHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Get tasks for selected date
  const getTasksForDate = (date: Date) => {
    return tasks.filter((t) => {
      const taskDate = new Date(t.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  // Get plant by ID
  const getPlant = (plantId: string): Plant | undefined => {
    return plants.find((p) => p.id === plantId);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Get today's and pending tasks
  const today = new Date();
  const todaysTasks = tasks.filter((t) => {
    const taskDate = new Date(t.dueDate);
    return taskDate.toDateString() === today.toDateString() && !t.completed;
  });

  const overdueTasks = tasks.filter((t) => {
    const taskDate = new Date(t.dueDate);
    return taskDate < today && !t.completed && taskDate.toDateString() !== today.toDateString();
  });

  const upcomingTasks = tasks.filter((t) => {
    const taskDate = new Date(t.dueDate);
    return taskDate > today && !t.completed;
  }).slice(0, 5);

  const handleCompleteTask = async (taskId: string) => {
    triggerHaptic();
    await completeTask(taskId);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSnoozeTask = async (taskId: string) => {
    triggerHaptic();
    await snoozeTask(taskId, 1);
  };

  const TaskCard = ({ task }: { task: CareTask }) => {
    const plant = getPlant(task.plantId);
    const taskStyle = TASK_COLORS[task.type];
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);

    const panGesture = Gesture.Pan()
      .runOnJS(true)
      .onUpdate((event) => {
        translateX.value = event.translationX;
      })
      .onEnd((event) => {
        if (event.translationX > 100) {
          // Swipe right - complete
          translateX.value = withTiming(300);
          opacity.value = withTiming(0, {}, () => {
            runOnJS(handleCompleteTask)(task.id);
          });
        } else if (event.translationX < -100) {
          // Swipe left - snooze
          translateX.value = withTiming(-300);
          opacity.value = withTiming(0, {}, () => {
            runOnJS(handleSnoozeTask)(task.id);
          });
        } else {
          translateX.value = withSpring(0);
        }
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
    }));

    if (!plant) return null;

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.taskCard, animatedStyle]}>
          {/* Swipe indicators */}
          <View style={styles.swipeIndicators}>
            <View style={[styles.swipeIndicator, styles.completeIndicator]}>
              <Text style={styles.swipeIcon}>✓</Text>
            </View>
            <View style={[styles.swipeIndicator, styles.snoozeIndicator]}>
              <Text style={styles.swipeIcon}>💤</Text>
            </View>
          </View>

          <View style={[styles.taskCardContent, { backgroundColor: taskStyle.bg }]}>
            <View style={styles.taskIcon}>
              <Text style={styles.taskEmoji}>{taskStyle.icon}</Text>
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskPlantName}>{plant.nickname}</Text>
              <Text style={styles.taskType}>
                {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
              </Text>
            </View>
            <Pressable
              onPress={() => handleCompleteTask(task.id)}
              style={({ pressed }) => [styles.completeButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.completeButtonText}>Done</Text>
            </Pressable>
          </View>
        </Animated.View>
      </GestureDetector>
    );
  };

  const renderCalendarDay = (day: Date | null, index: number) => {
    if (!day) {
      return <View key={`empty-${index}`} style={styles.calendarDay} />;
    }

    const isToday = day.toDateString() === today.toDateString();
    const isSelected = day.toDateString() === selectedDate.toDateString();
    const dayTasks = getTasksForDate(day);
    const hasWater = dayTasks.some((t) => t.type === "water" && !t.completed);
    const hasMist = dayTasks.some((t) => t.type === "mist" && !t.completed);
    const hasFertilize = dayTasks.some((t) => t.type === "fertilize" && !t.completed);

    return (
      <Pressable
        key={day.toISOString()}
        onPress={() => { triggerHaptic(); setSelectedDate(day); }}
        style={[
          styles.calendarDay,
          isToday && styles.calendarDayToday,
          isSelected && styles.calendarDaySelected,
        ]}
      >
        <Text style={[
          styles.calendarDayText,
          isToday && styles.calendarDayTextToday,
          isSelected && styles.calendarDayTextSelected,
        ]}>
          {day.getDate()}
        </Text>
        <View style={styles.taskDots}>
          {hasWater && <View style={[styles.taskDot, { backgroundColor: "#4FC3F7" }]} />}
          {hasMist && <View style={[styles.taskDot, { backgroundColor: "#26C6DA" }]} />}
          {hasFertilize && <View style={[styles.taskDot, { backgroundColor: "#FFA726" }]} />}
        </View>
      </Pressable>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Streak Banner */}
      <View style={styles.streakBanner}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <View style={styles.streakInfo}>
          <Text style={styles.streakDays}>{profile.streakDays}-day streak!</Text>
          <Text style={styles.streakMessage}>Keep it up, plant parent!</Text>
        </View>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <Pressable
          onPress={() => { triggerHaptic(); setViewMode("quest"); }}
          style={[styles.toggleButton, viewMode === "quest" && styles.toggleButtonActive]}
        >
          <Text style={[styles.toggleText, viewMode === "quest" && styles.toggleTextActive]}>Quest Log</Text>
        </Pressable>
        <Pressable
          onPress={() => { triggerHaptic(); setViewMode("calendar"); }}
          style={[styles.toggleButton, viewMode === "calendar" && styles.toggleButtonActive]}
        >
          <Text style={[styles.toggleText, viewMode === "calendar" && styles.toggleTextActive]}>Calendar</Text>
        </Pressable>
      </View>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Pressable onPress={() => {
              triggerHaptic();
              setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
            }}>
              <Text style={styles.calendarNav}>←</Text>
            </Pressable>
            <Text style={styles.calendarMonth}>
              {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </Text>
            <Pressable onPress={() => {
              triggerHaptic();
              setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
            }}>
              <Text style={styles.calendarNav}>→</Text>
            </Pressable>
          </View>
          <View style={styles.calendarWeekdays}>
            {DAYS.map((day) => (
              <Text key={day} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {generateCalendarDays().map((day, index) => renderCalendarDay(day, index))}
          </View>
        </View>
      )}

      {/* Section Title */}
      <Text style={styles.sectionTitle}>
        {viewMode === "quest" ? "Today's Quests" : `Tasks for ${selectedDate.toLocaleDateString()}`}
      </Text>
    </View>
  );

  const allTasks = viewMode === "quest"
    ? [...overdueTasks, ...todaysTasks, ...upcomingTasks]
    : getTasksForDate(selectedDate).filter((t) => !t.completed);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>✨</Text>
      <Text style={styles.emptyTitle}>All caught up!</Text>
      <Text style={styles.emptySubtitle}>Your plants are thriving. Check back later!</Text>
    </View>
  );

  return (
    <ScreenContainer containerClassName="bg-background">
      <FlatList
        data={allTasks}
        renderItem={({ item }) => <TaskCard task={item} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#A8E063"
            colors={["#A8E063"]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  streakBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accentOrange + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  streakEmoji: {
    fontSize: 36,
    marginRight: spacing.md,
  },
  streakInfo: {
    flex: 1,
  },
  streakDays: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.accentOrange,
  },
  streakMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.accentOrange,
    opacity: 0.8,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: borderRadius.sm,
  },
  toggleButtonActive: {
    backgroundColor: colors.surfaceLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray500,
  },
  toggleTextActive: {
    color: colors.primaryDark,
  },
  calendarContainer: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  calendarNav: {
    fontSize: typography.fontSize.xl,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
    paddingHorizontal: spacing.sm,
  },
  calendarMonth: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
  },
  calendarWeekdays: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  weekdayText: {
    flex: 1,
    textAlign: "center",
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray400,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  calendarDayToday: {
    backgroundColor: colors.primaryLight + '30',
    borderRadius: borderRadius.md,
  },
  calendarDaySelected: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  calendarDayText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray700,
  },
  calendarDayTextToday: {
    color: colors.primaryDark,
    fontWeight: typography.fontWeight.bold,
  },
  calendarDayTextSelected: {
    color: colors.surfaceLight,
    fontWeight: typography.fontWeight.bold,
  },
  taskDots: {
    flexDirection: "row",
    gap: 2,
    marginTop: 2,
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  taskCard: {
    marginBottom: spacing.md,
    position: "relative",
  },
  swipeIndicators: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  swipeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  completeIndicator: {
    backgroundColor: colors.primary,
  },
  snoozeIndicator: {
    backgroundColor: colors.accentPurple,
  },
  swipeIcon: {
    fontSize: 18,
    color: colors.surfaceLight,
  },
  taskCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskEmoji: {
    fontSize: 24,
  },
  taskInfo: {
    flex: 1,
  },
  taskPlantName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
    marginBottom: 2,
  },
  taskType: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
  },
  completeButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  completeButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.surfaceLight,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
    textAlign: "center",
  },
});
