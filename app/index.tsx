import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useApp, type Plant } from '@/lib/store';
import { colors } from '@/components/ui/design-system';

type FilterType = 'all' | 'water' | 'sick' | 'growing';

export default function MyJungleScreen() {
  const { plants, isLoading } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Get current hour for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Filter plants based on active filter
  const filteredPlants = (plants || []).filter((plant: Plant) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'water') return plant.status === 'thirsty';
    if (activeFilter === 'sick') return plant.status === 'struggling' || plant.status === 'dead';
    if (activeFilter === 'growing') return plant.status === 'growing';
    return true;
  });

  // Count plants needing attention
  const needsAttention = plants.filter(p => p.status === 'thirsty' || p.status === 'struggling')?.length || 0;

  const handlePlantPress = useCallback((plantId: string) => {
    router.push(`/plant/${plantId}` as any);
  }, []);

  const handleAddPlant = useCallback(() => {
    router.push('/scan' as any);
  }, []);

  if (isLoading) {
    return (
      <ScreenContainer edges={['top']} containerClassName="bg-backgroundLight">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Curating your jungle...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const PlantCard = ({ plant }: { plant: Plant }) => {
    // Determine status color/text based on plant status
    let statusColor = colors.primary;
    let statusText = "thriving";
    let statusIcon = "checkmark.circle.fill";

    if (plant.status === 'thirsty') {
      statusColor = colors.accentPink;
      statusText = "thirsty";
      statusIcon = "drop.fill";
    } else if (plant.status === 'mist') {
      statusColor = colors.accentCyan;
      statusText = "mist me";
      statusIcon = "cloud.rain.fill";
    } else if (plant.status === 'growing') {
      statusColor = colors.accentPurple;
      statusText = "growing";
      statusIcon = "scissors";
    }

    return (
      <Pressable
        onPress={() => handlePlantPress(plant.id)}
        style={({ pressed }) => [
          styles.card,
          { transform: [{ scale: pressed ? 0.98 : 1 }] }
        ]}
      >
        <View style={styles.cardImageContainer}>
          {plant.photo || (plant.photos && plant.photos.length > 0) ? (
            <ImageBackground
              source={{ uri: plant.photo || plant.photos[plant.photos.length - 1].uri }}
              style={styles.cardImage}
              imageStyle={{ borderRadius: 16 }}
            >
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <IconSymbol name={statusIcon as any} size={10} color="#fff" />
                <Text style={styles.statusText}>{statusText}</Text>
              </View>
            </ImageBackground>
          ) : (
            <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
              <Text style={styles.plantEmoji}>🌱</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <IconSymbol name={statusIcon as any} size={10} color="#fff" />
                <Text style={styles.statusText}>{statusText}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.plantName} numberOfLines={1}>{plant.nickname}</Text>
              <Text style={styles.plantSpecies} numberOfLines={1}>{plant.species}</Text>
            </View>
            <View style={styles.arrowButton}>
              <IconSymbol name="arrow.right" size={16} color={colors.textSub} />
            </View>
          </View>

          <View style={styles.cardFooter}>
            <IconSymbol name="mappin.and.ellipse" size={14} color={statusColor} />
            <Text style={styles.locationText}>{plant.location || 'Home'}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const FilterPill = ({ type, label, count }: { type: FilterType; label: string; count?: number }) => {
    const isActive = activeFilter === type;
    let bgColor = isActive ? colors.primary : colors.surfaceLight;
    let textColor = isActive ? '#ffffff' : colors.textSub;
    let borderColor = isActive ? colors.primary : colors.gray100;

    // Override colors for specific filters
    if (isActive && type === 'water') {
      bgColor = colors.accentPink;
      borderColor = colors.accentPink;
    } else if (isActive && type === 'sick') {
      bgColor = colors.accentOrange;
      borderColor = colors.accentOrange;
    } else if (isActive && type === 'growing') {
      bgColor = colors.accentPurple;
      borderColor = colors.accentPurple;
    }

    return (
      <Pressable
        onPress={() => setActiveFilter(type)}
        style={[
          styles.filterPill,
          { backgroundColor: bgColor, borderColor }
        ]}
      >
        <Text style={[styles.filterText, { color: textColor }]}>
          {label}{count !== undefined && ` (${count})`}
        </Text>
      </Pressable>
    );
  };

  return (
    <ScreenContainer edges={['top']} containerClassName="bg-backgroundLight">
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>{greeting}, Planter</Text>
            <Text style={styles.subtitleText}>
              Your jungle is thriving.
              {needsAttention > 0 && (
                <Text style={{ color: colors.accentPink, fontWeight: '700' }}>
                  {` ${needsAttention} plants`}
                </Text>
              )} need attention today.
            </Text>
          </View>

          {/* Indoor Temp Widget */}
          <View style={styles.tempWidget}>
            <View style={styles.tempIcon}>
              <IconSymbol name="sun.max.fill" size={20} color={colors.accentOrange} />
            </View>
            <View>
              <Text style={styles.tempLabel}>INDOOR TEMP</Text>
              <Text style={styles.tempValue}>22°C / 72°F</Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          <FilterPill type="all" label="All Plants" />
          <FilterPill
            type="water"
            label="To Water"
            count={plants.filter(p => p.status === 'thirsty').length}
          />
          <FilterPill type="sick" label="Sick Bay" />
          <FilterPill type="growing" label="Propagating" />
        </ScrollView>

        {/* Grid */}
        <View style={styles.grid}>
          {filteredPlants.map((plant) => (
            <View key={plant.id} style={styles.gridItem}>
              <PlantCard plant={plant} />
            </View>
          ))}

          {/* Add New Plant Card */}
          <View style={styles.gridItem}>
            <Pressable
              onPress={handleAddPlant}
              style={({ pressed }) => [
                styles.addCard,
                { transform: [{ scale: pressed ? 0.98 : 1 }] }
              ]}
            >
              <View style={styles.addIconCircle}>
                <IconSymbol name="plus" size={32} color={colors.accentPurple} />
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.addCardTitle}>Add New Plant</Text>
                <Text style={styles.addCardSubtitle}>Expand your jungle</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Add Button (Fixed Bottom Right) */}
      <Pressable
        onPress={handleAddPlant}
        style={({ pressed }) => [
          styles.fab,
          { transform: [{ scale: pressed ? 0.95 : 1 }] }
        ]}
      >
        <IconSymbol name="plus.circle.fill" size={24} color="#fff" />
        <Text style={styles.fabText}>ADD PLANT</Text>
      </Pressable>

      {/* Chat FAB (Small) */}
      <Pressable
        onPress={() => router.push('/chat')}
        style={({ pressed }) => [
          styles.chatFab,
          { transform: [{ scale: pressed ? 0.95 : 1 }] }
        ]}
      >
        <IconSymbol name="bubble.left.fill" size={24} color="#fff" />
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  loadingText: {
    color: colors.primaryDark,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
    gap: 16,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: colors.textMain,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Regular',
    color: colors.textSub,
    lineHeight: 22,
  },
  tempWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceLight,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray100,
    ...Platform.select({
      web: {
        display: 'flex',
      },
      default: {
        display: 'none',
      },
    }),
  },
  tempIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempLabel: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: colors.textSub,
  },
  tempValue: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: colors.textMain,
  },

  filtersScroll: {
    marginBottom: 24,
  },
  filtersContent: {
    gap: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    width: '50%',
    padding: 8,
  },

  card: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 24,
    padding: 12,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  cardImageContainer: {
    aspectRatio: 4 / 3,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantEmoji: {
    fontSize: 40,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    textTransform: 'uppercase',
  },

  cardContent: {
    paddingHorizontal: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: colors.textMain,
  },
  plantSpecies: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    color: colors.textSub,
    fontStyle: 'italic',
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  locationText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
    color: colors.textSub,
    textTransform: 'uppercase',
  },

  addCard: {
    aspectRatio: 3 / 4,
    backgroundColor: 'transparent',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  addIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accentPurple,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  addCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: colors.textMain,
  },
  addCardSubtitle: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    color: colors.textSub,
  },

  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.accentPurple,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: colors.accentPurple,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    letterSpacing: 0.5,
  },

  chatFab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});