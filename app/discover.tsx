import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  RefreshControl,
  Linking,
  TextInput,
  LayoutAnimation,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { colors, spacing, borderRadius, typography } from "@/components/ui/design-system";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [petSafeOnly, setPetSafeOnly] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [selectedLight, setSelectedLight] = useState<string | null>(null);

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

  const toggleFilters = () => {
    triggerHaptic();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    triggerHaptic();
    setMaxPrice(null);
    setPetSafeOnly(false);
    setSelectedDifficulty(null);
    setSelectedLight(null);
    setSearchQuery("");
  };

  const filteredPlants = DISCOVERY_PLANTS.filter((plant) => {
    // Search query filter
    if (searchQuery && !plant.name.toLowerCase().includes(searchQuery.toLowerCase()) && !plant.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter (only if no search query is active, or we can combine them)
    if (!searchQuery && plant.category !== selectedCategory) {
      return false;
    }

    // Price filter
    if (maxPrice !== null && plant.price > maxPrice) {
      return false;
    }

    // Pet safe filter
    if (petSafeOnly && !plant.petSafe) {
      return false;
    }

    // Difficulty filter
    if (selectedDifficulty !== null && plant.difficulty !== selectedDifficulty) {
      return false;
    }

    // Light needs filter
    if (selectedLight !== null && plant.lightNeeds !== selectedLight) {
      return false;
    }

    return true;
  });

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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={18} color={colors.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search plants..."
            placeholderTextColor={colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <IconSymbol name="xmark" size={14} color={colors.gray400} />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={toggleFilters}
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
        >
          <IconSymbol name="slider.horizontal.3" size={20} color={showFilters ? colors.surfaceLight : colors.gray900} />
        </Pressable>
      </View>

      {/* Expanded Filters */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Max Price: {maxPrice ? `$${maxPrice}` : 'Any'}</Text>
            <View style={styles.filterOptions}>
              {[25, 50, 100].map((price) => (
                <Pressable
                  key={price}
                  onPress={() => { triggerHaptic(); setMaxPrice(maxPrice === price ? null : price); }}
                  style={[styles.filterOption, maxPrice === price && styles.filterOptionActive]}
                >
                  <Text style={[styles.filterOptionText, maxPrice === price && styles.filterOptionTextActive]}>
                    Under ${price}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Light Needs</Text>
            <View style={styles.filterOptions}>
              {['low', 'medium', 'high'].map((light) => (
                <Pressable
                  key={light}
                  onPress={() => { triggerHaptic(); setSelectedLight(selectedLight === light ? null : light); }}
                  style={[styles.filterOption, selectedLight === light && styles.filterOptionActive]}
                >
                  <Text style={[styles.filterOptionText, selectedLight === light && styles.filterOptionTextActive]}>
                    {light.charAt(0).toUpperCase() + light.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Difficulty</Text>
            <View style={styles.filterOptions}>
              {[1, 2, 3].map((diff) => (
                <Pressable
                  key={diff}
                  onPress={() => { triggerHaptic(); setSelectedDifficulty(selectedDifficulty === diff ? null : diff); }}
                  style={[styles.filterOption, selectedDifficulty === diff && styles.filterOptionActive]}
                >
                  <Text style={[styles.filterOptionText, selectedDifficulty === diff && styles.filterOptionTextActive]}>
                    {'🌿'.repeat(diff)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <View style={styles.filterRow}>
              <Pressable
                onPress={() => { triggerHaptic(); setPetSafeOnly(!petSafeOnly); }}
                style={[styles.checkboxContainer, petSafeOnly && styles.checkboxActive]}
              >
                {petSafeOnly && <IconSymbol name="checkmark" size={12} color={colors.surfaceLight} />}
              </Pressable>
              <Text style={styles.filterLabelInline}>Pet Safe Only 🐾</Text>
            </View>
          </View>

          <Pressable onPress={resetFilters} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </Pressable>
        </View>
      )}

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
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.gray600,
    marginBottom: spacing.xl,
  },
  potwCard: {
    backgroundColor: colors.accentOrange + '10',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.accentOrange + '30',
  },
  potwBadge: {
    backgroundColor: colors.accentOrange,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  potwBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.surfaceLight,
  },
  potwContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  potwEmoji: {
    fontSize: 48,
    marginRight: spacing.lg,
  },
  potwInfo: {
    flex: 1,
  },
  potwName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
    marginBottom: 4,
  },
  potwDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
    marginBottom: 6,
  },
  potwPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.accentOrange,
  },
  recommendationsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
    marginBottom: spacing.md,
  },
  recommendationsList: {
    gap: spacing.md,
  },
  recommendationCard: {
    width: 130,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  recommendationEmoji: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight + '20',
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  recEmojiText: {
    fontSize: 32,
  },
  recommendationName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
    textAlign: "center",
    marginBottom: 4,
  },
  recommendationPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  categoryTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray600,
  },
  categoryLabelActive: {
    color: colors.surfaceLight,
  },
  plantCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  plantImageContainer: {
    height: 180,
    backgroundColor: colors.gray50,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  plantEmoji: {
    fontSize: 72,
  },
  priceBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.gray900,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  priceText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.surfaceLight,
  },
  petSafeBadge: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.surfaceLight,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  petSafeText: {
    fontSize: 18,
  },
  plantInfo: {
    padding: spacing.lg,
  },
  plantName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
    marginBottom: 4,
  },
  plantDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  difficultyContainer: {
    flexDirection: "row",
    gap: 2,
    marginBottom: spacing.sm,
  },
  difficultyLeaf: {
    fontSize: 12,
    opacity: 0.2,
  },
  difficultyLeafActive: {
    opacity: 1,
  },
  plantMeta: {
    marginBottom: spacing.md,
  },
  storeText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray400,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: "row",
  },
  shopButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    flex: 1,
    alignItems: 'center',
  },
  shopButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.surfaceLight,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  searchContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.gray900,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filtersPanel: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.gray100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filterGroup: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray700,
    marginBottom: spacing.sm,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  filterOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  filterOptionActive: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 12,
    color: colors.gray600,
  },
  filterOptionTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkboxContainer: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: colors.primary,
  },
  filterLabelInline: {
    fontSize: typography.fontSize.sm,
    color: colors.gray700,
  },
  resetButton: {
    marginTop: spacing.sm,
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  resetButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray400,
    textDecorationLine: "underline",
  },
});
