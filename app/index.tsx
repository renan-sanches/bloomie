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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const filteredPlants = (plants || []).filter((plant: Plant) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'water') return plant.status === 'thirsty';
    if (activeFilter === 'sick') return plant.status === 'struggling' || plant.status === 'dead';
    if (activeFilter === 'growing') return plant.status === 'growing';
    return true;
  });

  const needsAttention = plants.filter(p => p.status === 'thirsty' || p.status === 'struggling')?.length || 0;

  const handlePlantPress = useCallback((plantId: string) => {
    router.push(`/plant/${plantId}` as any);
  }, []);

  const handleAddPlant = useCallback(() => {
    router.push('/scan' as any);
  }, []);

  if (isLoading) {
    return (
      <ScreenContainer edges={['top']} containerClassName="bg-[#f8fafc]">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Curating your jungle...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const PlantCard = ({ plant }: { plant: Plant }) => {
    let statusColor = '#10b981';
    let statusText = "THRIVING";
    let statusIcon = "checkmark.circle.fill";

    if (plant.status === 'thirsty') {
      statusColor = '#ef4444';
      statusText = "THIRSTY";
      statusIcon = "drop.fill";
    } else if (plant.status === 'mist') {
      statusColor = '#06b6d4';
      statusText = "MIST ME";
      statusIcon = "cloud.rain.fill";
    } else if (plant.status === 'growing') {
      statusColor = '#8b5cf6';
      statusText = "GROWING";
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
              source={{ uri: plant.photo || (plant.photos && plant.photos.length > 0 ? plant.photos[plant.photos.length - 1].uri : '') }}
              style={styles.cardImage}
              imageStyle={{ borderRadius: 20 }}
            >
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <IconSymbol name={statusIcon as any} size={10} color="#fff" />
                <Text style={styles.statusBadgeText}>{statusText}</Text>
              </View>
            </ImageBackground>
          ) : (
            <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
              <Text style={styles.plantEmoji}>🌱</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <IconSymbol name={statusIcon as any} size={10} color="#fff" />
                <Text style={styles.statusBadgeText}>{statusText}</Text>
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
            <Pressable style={styles.cardArrow}>
              <IconSymbol name="chevron.right" size={16} color="#94a3b8" />
            </Pressable>
          </View>

          <View style={styles.cardFooter}>
            <View style={[styles.locationDot, { backgroundColor: statusColor }]} />
            <Text style={styles.locationText}>{plant.location || 'LIVING ROOM'}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const FilterPill = ({ type, label, count, icon }: { type: FilterType; label: string; count?: number; icon?: string }) => {
    const isActive = activeFilter === type;

    return (
      <Pressable
        onPress={() => setActiveFilter(type)}
        style={[
          styles.filterPill,
          isActive && styles.filterPillActive,
          isActive && type === 'water' && { backgroundColor: '#ef4444', borderColor: '#ef4444' },
          isActive && type === 'sick' && { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
          isActive && type === 'growing' && { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' },
        ]}
      >
        {icon && <IconSymbol name={icon as any} size={14} color={isActive ? "#fff" : "#64748b"} />}
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
          {label}{count !== undefined ? ` (${count})` : ''}
        </Text>
      </Pressable>
    );
  };

  return (
    <ScreenContainer edges={['top']} containerClassName="bg-[#fff]">
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Greeting Section */}
        <View style={styles.headerHero}>
          <View style={styles.greetingLeft}>
            <Text style={styles.greetingTitle}>{greeting}, Planter</Text>
            <Text style={styles.greetingSubtitle}>
              Your jungle is thriving.
              <Text style={styles.highlightText}>
                {` ${needsAttention} plants`}
              </Text> need attention today.
            </Text>
          </View>

          <View style={styles.weatherWidget}>
            <View style={styles.weatherIcon}>
              <IconSymbol name="sun.max.fill" size={20} color="#f59e0b" />
            </View>
            <View>
              <Text style={styles.weatherLabel}>INDOOR TEMP</Text>
              <Text style={styles.weatherValue}>22°C / 72°F</Text>
            </View>
          </View>
        </View>

        {/* Filters Row */}
        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
            <FilterPill type="all" label="All Plants" icon="square.grid.2x2.fill" />
            <FilterPill
              type="water"
              label="To Water"
              count={plants.filter(p => p.status === 'thirsty').length}
              icon="drop.fill"
            />
            <FilterPill type="sick" label="Sick Bay" icon="plus.square.fill" />
            <FilterPill type="growing" label="Propagating" icon="scissors" />
          </ScrollView>
        </View>

        {/* Plant Grid */}
        <View style={styles.plantGrid}>
          {filteredPlants.map((plant) => (
            <View key={plant.id} style={styles.gridCell}>
              <PlantCard plant={plant} />
            </View>
          ))}

          {/* Dotted Add Card */}
          <View style={styles.gridCell}>
            <Pressable
              onPress={handleAddPlant}
              style={({ pressed }) => [
                styles.addCardDotted,
                { transform: [{ scale: pressed ? 0.98 : 1 }] }
              ]}
            >
              <View style={styles.addIconBox}>
                <IconSymbol name="plus" size={32} color="#8b5cf6" />
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.addTitle}>Add New Plant</Text>
                <Text style={styles.addSubtitle}>Expand your Bloomie jungle</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        onPress={handleAddPlant}
        style={({ pressed }) => [
          styles.mainFab,
          { transform: [{ scale: pressed ? 0.95 : 1 }] }
        ]}
      >
        <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
        <Text style={styles.mainFabText}>ADD PLANT</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748b',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  scrollContent: {
    paddingBottom: 40,
    maxWidth: 1400,
    width: '100%',
    marginHorizontal: 'auto',
  },
  headerHero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 32,
  },
  greetingLeft: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 42,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
    letterSpacing: -1,
  },
  greetingSubtitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#64748b',
    marginTop: 8,
  },
  highlightText: {
    color: '#ef4444',
    fontWeight: '800',
  },
  weatherWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  weatherIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fffbeb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherLabel: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  filtersWrapper: {
    paddingHorizontal: 32,
    marginBottom: 40,
  },
  filtersList: {
    gap: 12,
    paddingRight: 32,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  filterPillActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#fff',
  },
  plantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
  },
  gridCell: {
    width: Platform.OS === 'web' ? '25%' : '50%',
    padding: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f8fafc',
  },
  cardImageContainer: {
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantEmoji: {
    fontSize: 48,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
  },
  cardContent: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  plantName: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  plantSpecies: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 2,
  },
  cardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  addCardDotted: {
    aspectRatio: 1,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#f8fafc40',
  },
  addIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  addTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  addSubtitle: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#94a3b8',
    marginTop: 4,
  },
  mainFab: {
    position: 'absolute',
    bottom: 48,
    right: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 24,
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  mainFabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    letterSpacing: 0.5,
  },
});