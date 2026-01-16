import React, { useState, useCallback } from 'react';
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

import { useApp, type Plant } from '@/lib/store';

// Memoized PlantCard for better performance
const MemoizedPlantCard = React.memo(PlantCard);

export default function MyJungleScreen() {
  const { plants, isLoading } = useApp();
  const [activeFilter, setActiveFilter] = useState<'all' | 'water' | 'healthy' | 'attention'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get current hour for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Filter plants based on active filter
  const filteredPlants = (plants || []).filter((plant: Plant) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'water') return plant.status === 'thirsty';
    if (activeFilter === 'healthy') return plant.status === 'thriving' || plant.status === 'growing';
    if (activeFilter === 'attention') return plant.status === 'mist' || plant.status === 'thirsty';
    return true;
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.subtitle}>Curating your jungle...</Text>
      </View>
    );
  }

  const handlePlantPress = useCallback((plantId: string) => {
    router.push(`/plant/${plantId}` as any);
  }, []);

  const handleAddPlant = useCallback(() => {
    router.push('/scan' as any);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

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
              <Text style={styles.statValue}>{plants.length}</Text>
              <Text style={styles.statLabel}>Plants</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {plants.filter(p => p.status === 'thirsty').length}
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
                <MemoizedPlantCard
                  name={plant.nickname}
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
        {/* Chat Tool FAB */}
        <Pressable
          onPress={() => router.push('/chat')}
          style={({ pressed }) => [
            styles.fab,
            styles.chatFab,
            pressed && styles.fabPressed,
          ]}
        >
          <Text style={styles.fabIcon}>💬</Text>
        </Pressable>

        {/* Add Plant FAB */}
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
    fontFamily: typography.fontFamily.display,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
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
    fontFamily: typography.fontFamily.display,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
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
    fontFamily: typography.fontFamily.brand,
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
    fontFamily: typography.fontFamily.display,
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.gray500,
    textAlign: 'center',
    fontFamily: typography.fontFamily.body,
  },

  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 90,
    right: spacing.lg,
    alignItems: 'center',
    gap: 16,
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
  chatFab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  fabIcon: {
    fontSize: 32,
    color: colors.surfaceLight,
  },

  bottomSpacer: {
    height: 40,
  },
});