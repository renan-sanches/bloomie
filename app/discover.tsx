import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  RefreshControl,
  Linking,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useApp } from "@/lib/store";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Discovery plant data
const DISCOVERY_PLANTS = [
  { id: "1", name: "Monstera Deliciosa", category: "trending", price: 45, store: "The Sill", difficulty: 2, emoji: "🪴", petSafe: false, lightNeeds: "medium", size: "large", description: "The iconic Swiss cheese plant with stunning fenestrated leaves." },
  { id: "2", name: "Pothos Golden", category: "beginner", price: 18, store: "Bloomscape", difficulty: 1, emoji: "🌱", petSafe: false, lightNeeds: "low", size: "small", description: "Nearly indestructible trailing vine perfect for beginners." },
  { id: "3", name: "Spider Plant", category: "pet-safe", price: 15, store: "The Sill", difficulty: 1, emoji: "🕷️", petSafe: true, lightNeeds: "medium", size: "medium", description: "Air-purifying classic that's safe for furry friends." },
  { id: "4", name: "Boston Fern", category: "pet-safe", price: 25, store: "Bloomscape", difficulty: 3, emoji: "🌿", petSafe: true, lightNeeds: "medium", size: "medium", description: "Lush, feathery fronds that love humidity." },
  { id: "5", name: "Fiddle Leaf Fig", category: "trending", price: 75, store: "The Sill", difficulty: 3, emoji: "🌳", petSafe: false, lightNeeds: "high", size: "large", description: "Statement plant with large, violin-shaped leaves." },
  { id: "6", name: "Snake Plant", category: "beginner", price: 28, store: "Bloomscape", difficulty: 1, emoji: "🌿", petSafe: false, lightNeeds: "low", size: "medium", description: "Architectural beauty that thrives on neglect." },
  { id: "7", name: "Calathea Orbifolia", category: "rare", price: 55, store: "The Sill", difficulty: 3, emoji: "🍃", petSafe: true, lightNeeds: "medium", size: "medium", description: "Stunning striped leaves that move with the light." },
  { id: "8", name: "Pink Princess Philodendron", category: "rare", price: 120, store: "Bloomscape", difficulty: 3, emoji: "💗", petSafe: false, lightNeeds: "medium", size: "medium", description: "Rare collector's plant with pink variegation." },
  { id: "9", name: "Parlor Palm", category: "pet-safe", price: 22, store: "The Sill", difficulty: 1, emoji: "🌴", petSafe: true, lightNeeds: "low", size: "medium", description: "Elegant palm that's safe for pets and easy to care for." },
  { id: "10", name: "ZZ Plant", category: "beginner", price: 32, store: "Bloomscape", difficulty: 1, emoji: "🌱", petSafe: false, lightNeeds: "low", size: "medium", description: "Glossy leaves that can survive almost anything." },
  { id: "11", name: "Alocasia Polly", category: "rare", price: 48, store: "The Sill", difficulty: 3, emoji: "🖤", petSafe: false, lightNeeds: "medium", size: "medium", description: "Dramatic arrow-shaped leaves with silver veins." },
  { id: "12", name: "Peperomia Hope", category: "beginner", price: 16, store: "Bloomscape", difficulty: 1, emoji: "🌿", petSafe: true, lightNeeds: "medium", size: "small", description: "Adorable trailing succulent-like plant." },
];

const PLANT_OF_THE_WEEK = {
  id: "potw",
  name: "Monstera Thai Constellation",
  price: 150,
  store: "Rare Plant Shop",
  emoji: "🌟",
  description: "This week's star: Stunning cream-splashed variegation on every leaf!",
};

const CATEGORIES = [
  { id: "trending", label: "Trending", emoji: "🔥" },
  { id: "beginner", label: "Beginner-Friendly", emoji: "🌱" },
  { id: "pet-safe", label: "Pet-Safe", emoji: "🐾" },
  { id: "rare", label: "Rare Finds", emoji: "💎" },
];

export default function DiscoverScreen() {
  const { plants } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("trending");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const triggerHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const filteredPlants = DISCOVERY_PLANTS.filter(
    (plant) => plant.category === selectedCategory
  );

  // AI Recommendations based on user's plants
  const getRecommendations = () => {
    const userPlantSpecies = plants.map((p) => p.species.toLowerCase());
    return DISCOVERY_PLANTS.filter((plant) => {
      // Recommend plants similar to what user has or complementary
      if (userPlantSpecies.includes(plant.name.toLowerCase())) return false;
      // Simple recommendation logic - recommend easy plants if user is new
      if (plants.length < 3 && plant.difficulty === 1) return true;
      // Recommend pet-safe if user has pet-safe plants
      if (plants.some((p) => p.species.includes("Spider") || p.species.includes("Fern"))) {
        return plant.petSafe;
      }
      return plant.difficulty <= 2;
    }).slice(0, 3);
  };

  const recommendations = getRecommendations();

  const handleShopNow = (plant: typeof DISCOVERY_PLANTS[0]) => {
    triggerHaptic();
    // Open affiliate link (simulated)
    Linking.openURL(`https://www.google.com/search?q=buy+${encodeURIComponent(plant.name)}`);
  };

  const renderDifficultyLeaves = (difficulty: number) => (
    <View style={styles.difficultyContainer}>
      {[1, 2, 3].map((level) => (
        <Text key={level} style={[styles.difficultyLeaf, level <= difficulty && styles.difficultyLeafActive]}>
          🌿
        </Text>
      ))}
    </View>
  );

  const renderPlantCard = ({ item }: { item: typeof DISCOVERY_PLANTS[0] }) => (
    <View style={styles.plantCard}>
      <View style={styles.plantImageContainer}>
        <Text style={styles.plantEmoji}>{item.emoji}</Text>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>${item.price}</Text>
        </View>
        {item.petSafe && (
          <View style={styles.petSafeBadge}>
            <Text style={styles.petSafeText}>🐾</Text>
          </View>
        )}
      </View>
      <View style={styles.plantInfo}>
        <Text style={styles.plantName}>{item.name}</Text>
        <Text style={styles.plantDescription} numberOfLines={2}>{item.description}</Text>
        {renderDifficultyLeaves(item.difficulty)}
        <View style={styles.plantMeta}>
          <Text style={styles.storeText}>at {item.store}</Text>
        </View>
        <View style={styles.cardActions}>
          <Pressable
            onPress={() => handleShopNow(item)}
            style={({ pressed }) => [styles.shopButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.shopButtonText}>Shop Now</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderRecommendationCard = ({ item }: { item: typeof DISCOVERY_PLANTS[0] }) => (
    <Pressable
      onPress={() => handleShopNow(item)}
      style={({ pressed }) => [styles.recommendationCard, pressed && styles.cardPressed]}
    >
      <View style={styles.recommendationEmoji}>
        <Text style={styles.recEmojiText}>{item.emoji}</Text>
      </View>
      <Text style={styles.recommendationName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.recommendationPrice}>${item.price}</Text>
    </Pressable>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Title */}
      <Text style={styles.title}>Discover</Text>
      <Text style={styles.subtitle}>Find your next plant obsession</Text>

      {/* Plant of the Week */}
      <Pressable
        onPress={() => {
          triggerHaptic();
          Linking.openURL(`https://www.google.com/search?q=buy+${encodeURIComponent(PLANT_OF_THE_WEEK.name)}`);
        }}
        style={({ pressed }) => [styles.potwCard, pressed && styles.cardPressed]}
      >
        <View style={styles.potwBadge}>
          <Text style={styles.potwBadgeText}>🌟 Plant of the Week</Text>
        </View>
        <View style={styles.potwContent}>
          <Text style={styles.potwEmoji}>{PLANT_OF_THE_WEEK.emoji}</Text>
          <View style={styles.potwInfo}>
            <Text style={styles.potwName}>{PLANT_OF_THE_WEEK.name}</Text>
            <Text style={styles.potwDescription}>{PLANT_OF_THE_WEEK.description}</Text>
            <Text style={styles.potwPrice}>${PLANT_OF_THE_WEEK.price} at {PLANT_OF_THE_WEEK.store}</Text>
          </View>
        </View>
      </Pressable>

      {/* AI Recommendations */}
      {recommendations.length > 0 && plants.length > 0 && (
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Recommended for Your Jungle</Text>
          <Text style={styles.sectionSubtitle}>Based on your current plants</Text>
          <FlatList
            data={recommendations}
            renderItem={renderRecommendationCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendationsList}
          />
        </View>
      )}

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        {CATEGORIES.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => { triggerHaptic(); setSelectedCategory(category.id); }}
            style={[
              styles.categoryTab,
              selectedCategory === category.id && styles.categoryTabActive,
            ]}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text style={[
              styles.categoryLabel,
              selectedCategory === category.id && styles.categoryLabelActive,
            ]}>
              {category.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <ScreenContainer containerClassName="bg-background">
      <FlatList
        data={filteredPlants}
        renderItem={renderPlantCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
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
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C3E50",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#687076",
    marginBottom: 20,
  },
  potwCard: {
    backgroundColor: "#FFF3E0",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FFD93D",
  },
  potwBadge: {
    backgroundColor: "#FFD93D",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  potwBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2C3E50",
  },
  potwContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  potwEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  potwInfo: {
    flex: 1,
  },
  potwName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 4,
  },
  potwDescription: {
    fontSize: 13,
    color: "#687076",
    marginBottom: 6,
  },
  potwPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E65100",
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#687076",
    marginBottom: 12,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationCard: {
    width: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  recommendationEmoji: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F5FFF0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  recEmojiText: {
    fontSize: 28,
  },
  recommendationName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 4,
  },
  recommendationPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#A8E063",
  },
  categoryTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#F5F5F0",
    borderRadius: 12,
  },
  categoryTabActive: {
    backgroundColor: "#A8E063",
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#687076",
  },
  categoryLabelActive: {
    color: "#2D5A27",
  },
  plantCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  plantImageContainer: {
    height: 160,
    backgroundColor: "#F5FFF0",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  plantEmoji: {
    fontSize: 64,
  },
  priceBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#2D5A27",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  petSafeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#FFFFFF",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  petSafeText: {
    fontSize: 16,
  },
  plantInfo: {
    padding: 16,
  },
  plantName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 6,
  },
  plantDescription: {
    fontSize: 14,
    color: "#687076",
    lineHeight: 20,
    marginBottom: 8,
  },
  difficultyContainer: {
    flexDirection: "row",
    gap: 2,
    marginBottom: 8,
  },
  difficultyLeaf: {
    fontSize: 12,
    opacity: 0.3,
  },
  difficultyLeafActive: {
    opacity: 1,
  },
  plantMeta: {
    marginBottom: 12,
  },
  storeText: {
    fontSize: 13,
    color: "#9BA1A6",
  },
  cardActions: {
    flexDirection: "row",
  },
  shopButton: {
    backgroundColor: "#A8E063",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2D5A27",
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
});
