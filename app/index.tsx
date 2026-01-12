import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  PlantCard,
  FilterPill,
  GradientButton,
  colors,
  typography,
  spacing,
  borderRadius,
} from '@/components/ui/design-system';
import { Logo } from '@/components/ui/logo';

// Mock data for now (will be replaced with real data from Firestore in Phase 3)
const MOCK_PLANTS = [
  {
    id: '1',
    name: 'Monstera',
    species: 'Monstera Deliciosa',
    status: 'thirsty' as const,
    location: 'Living Room',
  },
  {
    id: '2',
    name: 'Figgy',
    species: 'Ficus Lyrata',
    status: 'thriving' as const,
    location: 'Bedroom Corner',
  },
  {
    id: '3',
    name: 'Snakey',
    species: 'Sansevieria',
    status: 'mist' as const,
    location: 'Home Office',
  },
  {
    id: '4',
    name: 'Goldie',
    species: 'Epipremnum Aureum',
    status: 'growing' as const,
    location: 'Kitchen Shelf',
  },
];

type FilterType = 'all' | 'water' | 'healthy' | 'attention';

export default function MyJungleScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get current hour for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Filter plants based on active filter
  const filteredPlants = MOCK_PLANTS.filter((plant) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'water') return plant.status === 'thirsty';
    if (activeFilter === 'healthy') return plant.status === 'thriving';
    if (activeFilter === 'attention') return plant.status === 'mist' || plant.status === 'growing';
    return true;
  });

  const handlePlantPress = (plantId: string) => {
    router.push(`/plant/${plantId}` as any);
  };

  const handleAddPlant = () => {
    // TODO: Navigate to add plant screen
    console.log('Add plant');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header with Logo */}
      <View style={styles.headerContainer}>
        <Logo size="medium" />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting} 🌿</Text>
            <Text style={styles.subtitle}>Your jungle is thriving</Text>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{MOCK_PLANTS.length}</Text>
              <Text style={styles.statLabel}>Plants</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {MOCK_PLANTS.filter(p => p.waterDue).length}
              </Text>
              <Text style={styles.statLabel}>Need water</Text>
            </View>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <FilterPill
              label="All Plants"
              active={activeFilter === 'all'}
              onPress={() => setActiveFilter('all')}
            />
            <FilterPill
              label="💧 Need Water"
              active={activeFilter === 'water'}
              onPress={() => setActiveFilter('water')}
            />
            <FilterPill
              label="✨ Healthy"
              active={activeFilter === 'healthy'}
              onPress={() => setActiveFilter('healthy')}
            />
            <FilterPill
              label="⚠️ Attention"
              active={activeFilter === 'attention'}
              onPress={() => setActiveFilter('attention')}
            />
          </ScrollView>
        </View>

        {/* View Mode Toggle */}
        <View style={styles.viewModeContainer}>
          <Text style={styles.resultsText}>
            {filteredPlants.length} {filteredPlants.length === 1 ? 'plant' : 'plants'}
          </Text>

          <View style={styles.viewModeToggle}>
            <Pressable
              onPress={() => setViewMode('grid')}
              style={[
                styles.viewModeButton,
                viewMode === 'grid' && styles.viewModeButtonActive,
              ]}
            >
              <Text style={[
                styles.viewModeIcon,
                viewMode === 'grid' && styles.viewModeIconActive,
              ]}>
                ▦
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setViewMode('list')}
              style={[
                styles.viewModeButton,
                viewMode === 'list' && styles.viewModeButtonActive,
              ]}
            >
              <Text style={[
                styles.viewModeIcon,
                viewMode === 'list' && styles.viewModeIconActive,
              ]}>
                ☰
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Plants Grid/List */}
        {filteredPlants.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🌱</Text>
            <Text style={styles.emptyStateTitle}>No plants found</Text>
            <Text style={styles.emptyStateText}>
              {activeFilter === 'all'
                ? 'Add your first plant to get started'
                : 'Try a different filter'}
            </Text>
          </View>
        ) : (
          <View style={viewMode === 'grid' ? styles.plantsGrid : styles.plantsList}>
            {filteredPlants.map((plant) => (
              <View
                key={plant.id}
                style={viewMode === 'grid' ? styles.plantGridItem : styles.plantListItem}
              >
                <PlantCard
                  name={plant.name}
                  species={plant.species}
                  status={plant.status}
                  location={plant.location}
                  onPress={() => handlePlantPress(plant.id)}
                />
              </View>
            ))}
          </View>
        )}

        {/* Bottom Spacing for FAB */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <Pressable
          onPress={handleAddPlant}
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.fabPressed,
          ]}
        >
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },

  // Header with Logo
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoIcon: {
    width: 44,
    height: 44,
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 28,
  },
  logoText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
    letterSpacing: -0.5,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: 100, // Space for FAB
  },

  // Header
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.gray500,
    marginBottom: spacing.lg,
  },

  // Stats
  stats: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray200,
    marginHorizontal: spacing.lg,
  },

  // Filters
  filterContainer: {
    marginBottom: spacing.lg,
  },
  filterScroll: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },

  // View Mode
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  resultsText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray600,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.md,
    padding: 4,
  },
  viewModeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  viewModeButtonActive: {
    backgroundColor: colors.surfaceLight,
  },
  viewModeIcon: {
    fontSize: typography.fontSize.lg,
    color: colors.gray400,
  },
  viewModeIconActive: {
    color: colors.primary,
  },

  // Plants Grid/List
  plantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  plantGridItem: {
    width: '50%',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  plantsList: {
    gap: spacing.md,
  },
  plantListItem: {
    width: '100%',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.gray500,
    textAlign: 'center',
  },

  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 90,
    right: spacing.lg,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  fabIcon: {
    fontSize: 32,
    color: colors.surfaceLight,
    fontWeight: typography.fontWeight.bold,
  },

  bottomSpacer: {
    height: 40,
  },
});