import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  RefreshControl,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useApp, getGreeting, getPlantStatus, formatTimeAgo, type Plant } from "@/lib/store";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { Image } from "expo-image";
import { BloomieBuddyButton } from "@/components/bloomie-buddy-button";

// Plant illustrations for empty/default states
const PLANT_ILLUSTRATIONS: Record<string, string> = {
  monstera: "🪴",
  fern: "🌿",
  succulent: "🌵",
  flower: "🌸",
  cactus: "🌵",
  palm: "🌴",
  default: "🌱",
};

export default function HomeScreen() {
  const { plants, tasks, profile, preferences, insights, refreshData, completeTask } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Check if onboarding is needed
  useEffect(() => {
    if (!preferences.onboardingCompleted) {
      router.replace("/onboarding");
    }
  }, [preferences.onboardingCompleted]);

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

  // Calculate stats
  const todaysTasks = tasks.filter((t) => {
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    return (
      dueDate.toDateString() === today.toDateString() &&
      !t.completed
    );
  });

  const completedToday = tasks.filter((t) => {
    if (!t.completedDate) return false;
    const completedDate = new Date(t.completedDate);
    const today = new Date();
    return completedDate.toDateString() === today.toDateString();
  }).length;

  // Get active insights
  const activeInsights = insights.filter((i) => !i.dismissed).slice(0, 2);

  const handlePlantPress = (plant: Plant) => {
    triggerHaptic();
    router.push(`/plant/${plant.id}` as any);
  };

  const handleQuickAction = async (plantId: string, action: "water" | "mist" | "fertilize" | "rotate") => {
    triggerHaptic();
    const task = tasks.find((t) => t.plantId === plantId && t.type === action && !t.completed);
    if (task) {
      await completeTask(task.id);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const renderPlantCard = ({ item }: { item: Plant }) => {
    const status = getPlantStatus(item);
    const plantEmoji = PLANT_ILLUSTRATIONS[item.species.toLowerCase()] || PLANT_ILLUSTRATIONS.default;

    return (
      <Pressable
        onPress={() => handlePlantPress(item)}
        style={({ pressed }) => [
          styles.plantCard,
          viewMode === "list" && styles.plantCardList,
          pressed && styles.cardPressed,
        ]}
      >
        {/* Plant Image or Emoji */}
        <View style={[styles.plantImageContainer, viewMode === "list" && styles.plantImageContainerList]}>
          {item.photo ? (
            <Image source={{ uri: item.photo }} style={styles.plantImage} contentFit="cover" />
          ) : (
            <Text style={styles.plantEmoji}>{plantEmoji}</Text>
          )}
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            {status.status === "happy" && <Text style={styles.statusIcon}>✓</Text>}
            {status.status === "thirsty" && <Text style={styles.statusIcon}>💧</Text>}
            {status.status === "needs-light" && <Text style={styles.statusIcon}>☀️</Text>}
            {status.status === "needs-attention" && <Text style={styles.statusIcon}>!</Text>}
          </View>
        </View>

        {/* Plant Info */}
        <View style={[styles.plantInfo, viewMode === "list" && styles.plantInfoList]}>
          <Text style={styles.plantNickname} numberOfLines={1}>{item.nickname}</Text>
          <Text style={styles.plantSpecies} numberOfLines={1}>{item.species}</Text>
          {item.lastWatered && (
            <Text style={styles.lastWatered}>
              Watered {formatTimeAgo(item.lastWatered)}
            </Text>
          )}
        </View>

        {/* Quick Actions (visible on list view) */}
        {viewMode === "list" && (
          <View style={styles.quickActions}>
            <Pressable
              onPress={() => handleQuickAction(item.id, "water")}
              style={({ pressed }) => [styles.quickActionButton, styles.waterButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.quickActionIcon}>💧</Text>
            </Pressable>
            <Pressable
              onPress={() => handleQuickAction(item.id, "mist")}
              style={({ pressed }) => [styles.quickActionButton, styles.mistButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.quickActionIcon}>💨</Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    );
  };