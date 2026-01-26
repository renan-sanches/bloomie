import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  RefreshControl,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useApp, type CareTask, type Plant } from "@/lib/store";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { IconSymbol } from "@/components/ui/icon-symbol";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const TASK_CONFIG: Record<string, { bg: string; icon: string; color: string }> = {
  water: { bg: '#eff6ff', icon: "drop.fill", color: "#3b82f6" },
  mist: { bg: '#ecfeff', icon: "cloud.rain.fill", color: "#06b6d4" },
  fertilize: { bg: '#f0fdf4', icon: "leaf.fill", color: "#10b981" },
  rotate: { bg: '#fdf4ff', icon: "arrow.triangle.2.circlepath", color: "#a855f7" },
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

  const getTasksForDate = (date: Date) => {
    return tasks.filter((t) => {
      const taskDate = new Date(t.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getPlant = (plantId: string): Plant | undefined => {
    return plants.find((p) => p.id === plantId);
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

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
  }).slice(0, 10);

  const handleCompleteTask = async (taskId: string) => {
    triggerHaptic();
    await completeTask(taskId);
  };

  const TaskCard = ({ task, index }: { task: CareTask; index: number }) => {
    const plant = getPlant(task.plantId);
    const config = TASK_CONFIG[task.type] || TASK_CONFIG.water;

    if (!plant) return null;

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100)}
        style={styles.taskCard}
      >
        <View style={[styles.taskIconBox, { backgroundColor: config.bg }]}>
          <IconSymbol name={config.icon as any} size={20} color={config.color} />
        </View>
        <View style={styles.taskMain}>
          <Text style={styles.taskPlantName}>{plant.nickname}</Text>
          <View style={styles.taskMeta}>
            <Text style={styles.taskTypeName}>{task.type.toUpperCase()}</Text>
            <View style={styles.dot} />
            <Text style={styles.taskDueDate}>
              {new Date(task.dueDate).toDateString() === today.toDateString() ? 'Today' : formatTimeAgo(task.dueDate)}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => handleCompleteTask(task.id)}
          style={styles.checkBtn}
        >
          <IconSymbol name="checkmark" size={18} color="#fff" />
        </Pressable>
      </Animated.View>
    );
  };

  const renderCalendarDay = (day: Date | null, index: number) => {
    if (!day) return <View key={`empty-${index}`} style={styles.calendarDay} />;

    const isToday = day.toDateString() === today.toDateString();
    const isSelected = day.toDateString() === selectedDate.toDateString();
    const dayTasks = getTasksForDate(day);
    const hasPending = dayTasks.some((t) => !t.completed);

    return (
      <Pressable
        key={day.toISOString()}
        onPress={() => { triggerHaptic(); setSelectedDate(day); }}
        style={[
          styles.calendarDay,
          isToday && styles.dayToday,
          isSelected && styles.daySelected,
        ]}
      >
        <Text style={[
          styles.dayText,
          isToday && styles.dayTextToday,
          isSelected && styles.dayTextSelected,
        ]}>
          {day.getDate()}
        </Text>
        {hasPending && !isSelected && <View style={styles.pendingDot} />}
      </Pressable>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.heroRow}>
        <View>
          <Text style={styles.heroTitle}>Daily Schedule</Text>
          <Text style={styles.heroSubtitle}>You have {allTasks.length} tasks pending</Text>
        </View>
        <View style={styles.streakBox}>
          <Text style={styles.streakCount}>{profile.streakDays}</Text>
          <Text style={styles.streakLabel}>STREAK</Text>
        </View>
      </View>

      <View style={styles.viewToggle}>
        <Pressable
          onPress={() => { triggerHaptic(); setViewMode("quest"); }}
          style={[styles.toggleBtn, viewMode === "quest" && styles.toggleBtnActive]}
        >
          <Text style={[styles.toggleBtnText, viewMode === "quest" && styles.toggleTextActive]}>Quest Log</Text>
        </Pressable>
        <Pressable
          onPress={() => { triggerHaptic(); setViewMode("calendar"); }}
          style={[styles.toggleBtn, viewMode === "calendar" && styles.toggleBtnActive]}
        >
          <Text style={[styles.toggleBtnText, viewMode === "calendar" && styles.toggleTextActive]}>Calendar</Text>
        </Pressable>
      </View>

      {viewMode === "calendar" && (
        <Animated.View entering={FadeIn} style={styles.calendarCard}>
          <View style={styles.calHeader}>
            <Text style={styles.calMonthText}>
              {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </Text>
            <View style={styles.calNav}>
              <Pressable onPress={() => {
                setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
              }}>
                <IconSymbol name="chevron.left" size={16} color="#1e293b" />
              </Pressable>
              <Pressable onPress={() => {
                setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
              }}>
                <IconSymbol name="chevron.right" size={16} color="#1e293b" />
              </Pressable>
            </View>
          </View>
          <View style={styles.weekRow}>
            {DAYS.map((day) => (
              <Text key={day} style={styles.weekText}>{day[0]}</Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {generateCalendarDays().map((day, index) => renderCalendarDay(day, index))}
          </View>
        </Animated.View>
      )}

      <Text style={styles.listTitle}>
        {viewMode === "quest" ? "Upcoming Tasks" : `Tasks for ${selectedDate.toDateString() === today.toDateString() ? 'Today' : selectedDate.toLocaleDateString()}`}
      </Text>
    </View>
  );

  const allTasks = viewMode === "quest"
    ? [...overdueTasks, ...todaysTasks, ...upcomingTasks]
    : getTasksForDate(selectedDate).filter((t) => !t.completed);

  return (
    <ScreenContainer edges={['top']} containerClassName="bg-[#fff]">
      <FlatList
        data={allTasks}
        renderItem={({ item, index }) => <TaskCard task={item} index={index} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>Your plants are happy and healthy.</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

function formatTimeAgo(date: any) {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff > 1) return `In ${diff} days`;
  return `${Math.abs(diff)}d ago`;
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 32,
    paddingBottom: 100,
    maxWidth: 800,
    width: '100%',
    marginHorizontal: 'auto',
  },
  header: {
    paddingTop: 32,
    paddingBottom: 24,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Medium',
    marginTop: 4,
  },
  streakBox: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  streakCount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#f59e0b',
  },
  streakLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fbbf24',
    letterSpacing: 1,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 6,
    marginBottom: 32,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  toggleBtnActive: {
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  toggleTextActive: {
    color: '#1e293b',
  },
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 20,
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  calMonthText: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  calNav: {
    flexDirection: 'row',
    gap: 16,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  weekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  daySelected: {
    backgroundColor: '#10b981',
    borderRadius: 12,
  },
  dayToday: {
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 12,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '900',
  },
  dayTextToday: {
    color: '#10b981',
    fontWeight: '900',
  },
  pendingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    position: 'absolute',
    bottom: 6,
  },
  listTitle: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
    marginBottom: 20,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 16,
  },
  taskIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskMain: {
    flex: 1,
    gap: 2,
  },
  taskPlantName: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskTypeName: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#cbd5e1',
  },
  taskDueDate: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  checkBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  emptySub: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  }
} as any);
