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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Theme from design
const theme = {
  primary: "#4ade80",
  primaryDark: "#16a34a",
  backgroundLight: "#f8fafc",
  surfaceLight: "#ffffff",
  accentPink: "#f43f5e",
  accentPurple: "#8b5cf6",
  accentOrange: "#f59e0b",
  accentCyan: "#06b6d4",
  textMain: "#0f172a",
  textSub: "#64748b",
  shadowGreen: 'rgba(74, 222, 128, 0.15)',
};

export default function MyJungleScreen() {
  const { plants, isLoading } = useApp();
  const [activeFilter, setActiveFilter] = useState<'all' | 'water' | 'sick' | 'prop'>('all');
  const insets = useSafeAreaInsets();

  // Get current hour for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Filter plants based on active filter
  const filteredPlants = (plants || []).filter((plant: Plant) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'water') return plant.status === 'thirsty';
    if (activeFilter === 'sick') return plant.status === 'struggling' || plant.status === 'dead';
    if (activeFilter === 'prop') return plant.status === 'growing'; // Mapping 'growing' to Propagating for demo
    return true;
  });

  const handlePlantPress = useCallback((plantId: string) => {
    router.push(`/plant/${plantId}` as any);
  }, []);

  const handleAddPlant = useCallback(() => {
    router.push('/scan' as any);
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.primaryDark }}>Curating your jungle...</Text>
      </View>
    );
  }

  const PlantCard = ({ plant }: { plant: Plant }) => {
    // Determine status color/text based on plant status
    let statusColor = theme.primary;
    let statusText = "thriving";
    let statusIcon = "checkmark.circle.fill";

    if (plant.status === 'thirsty') {
      statusColor = theme.accentPink;
      statusText = "thirsty";
      statusIcon = "drop.fill";
    } else if (plant.status === 'mist') {
      statusColor = theme.accentCyan;
      statusText = "mist me";
      statusIcon = "cloud.rain.fill";
    } else if (plant.status === 'growing') {
      statusColor = theme.accentPurple;
      statusText = "growing";
      statusIcon = "leaf.fill";
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
            <View style={[styles.cardImage, { backgroundColor: theme.backgroundLight, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ fontSize: 40 }}>🌱</Text>
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
              <IconSymbol name="arrow.right" size={16} color={theme.textSub} />
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

  return (
    <ScreenContainer edges={['top']} containerClassName="bg-backgroundLight">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <IconSymbol name="leaf.fill" size={24} color={theme.primaryDark} />
            </View>
            <Text style={styles.logoText}>Bloomie</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.notifButton}>
              <IconSymbol name="bell.fill" size={20} color={theme.textSub} />
              <View style={styles.notifDot} />
            </Pressable>
            <View style={styles.avatar} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>{greeting}, Planter</Text>
            <Text style={styles.subtitleText}>
              Your jungle is thriving. <Text style={{ color: theme.accentPink, fontWeight: '700' }}>
                {plants.filter(p => p.status === 'thirsty').length} plants
              </Text> need attention.
            </Text>
          </View>
          {/* Temp Widget (Hidden on small screens in design, but we show it) */}
          <View style={styles.tempWidget}>
            <View style={styles.tempIcon}>
              <IconSymbol name="sun.max.fill" size={20} color={theme.accentOrange} />
            </View>
            <View>
              <Text style={styles.tempLabel}>INDOOR</Text>
              <Text style={styles.tempValue}>72°F</Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersContent}>
          <Pressable
            onPress={() => setActiveFilter('all')}
            style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
          >
            <IconSymbol name="square.grid.2x2.fill" size={16} color={activeFilter === 'all' ? '#fff' : theme.textSub} />
            <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>All Plants</Text>
          </Pressable>
          
          <Pressable
            onPress={() => setActiveFilter('water')}
            style={[styles.filterPill, activeFilter === 'water' ? { backgroundColor: theme.accentPink, borderColor: theme.accentPink } : {}]}
          >
            <IconSymbol name="drop.fill" size={16} color={activeFilter === 'water' ? '#fff' : theme.textSub} />
            <Text style={[styles.filterText, activeFilter === 'water' && styles.filterTextActive]}>To Water</Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('sick')}
            style={[styles.filterPill, activeFilter === 'sick' ? { backgroundColor: theme.accentOrange, borderColor: theme.accentOrange } : {}]}
          >
            <IconSymbol name="cross.case.fill" size={16} color={activeFilter === 'sick' ? '#fff' : theme.textSub} />
            <Text style={[styles.filterText, activeFilter === 'sick' && styles.filterTextActive]}>Sick Bay</Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('prop')}
            style={[styles.filterPill, activeFilter === 'prop' ? { backgroundColor: theme.accentPurple, borderColor: theme.accentPurple } : {}]}
          >
            <IconSymbol name="scissors" size={16} color={activeFilter === 'prop' ? '#fff' : theme.textSub} />
            <Text style={[styles.filterText, activeFilter === 'prop' && styles.filterTextActive]}>Propagating</Text>
          </Pressable>
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
                <IconSymbol name="plus" size={32} color={theme.accentPurple} />
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
          { bottom: 100, right: 24 }, // Position above Add Plant
          { transform: [{ scale: pressed ? 0.95 : 1 }] }
        ]}
      >
        <IconSymbol name="bubble.left.fill" size={24} color="#fff" />
      </Pressable>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.backgroundLight },
  
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(74, 222, 128, 0.2)', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 20, fontWeight: '800', color: theme.textMain },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  notifButton: { position: 'relative' },
  notifDot: { position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: theme.accentPink, borderWidth: 1, borderColor: '#fff' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e2e8f0' },

  scrollContent: { paddingHorizontal: 24, paddingTop: 24 },
  
  greetingSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  greetingText: { fontSize: 28, fontWeight: '800', color: theme.textMain, marginBottom: 4 },
  subtitleText: { fontSize: 16, color: theme.textSub, lineHeight: 22 },
  tempWidget: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.surfaceLight, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  tempIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(245, 158, 11, 0.1)', alignItems: 'center', justifyContent: 'center' },
  tempLabel: { fontSize: 10, fontWeight: '800', color: theme.textSub },
  tempValue: { fontSize: 14, fontWeight: '800', color: theme.textMain },

  filtersScroll: { marginBottom: 24, marginHorizontal: -24 },
  filtersContent: { paddingHorizontal: 24, gap: 12 },
  filterPill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, backgroundColor: theme.surfaceLight, borderWidth: 1, borderColor: '#f1f5f9' },
  filterPillActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  filterText: { fontSize: 14, fontWeight: '700', color: theme.textSub },
  filterTextActive: { color: '#fff' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  gridItem: { width: '50%', padding: 8 },
  
  card: { backgroundColor: theme.surfaceLight, borderRadius: 24, padding: 12, shadowColor: theme.primary, shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: {width: 0, height: 10} },
  cardImageContainer: { aspectRatio: 4/3, borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  cardImage: { width: '100%', height: '100%' },
  statusBadge: { position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  
  cardContent: { paddingHorizontal: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  plantName: { fontSize: 16, fontWeight: '800', color: theme.textMain },
  plantSpecies: { fontSize: 12, color: theme.textSub, fontStyle: 'italic' },
  arrowButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.backgroundLight, alignItems: 'center', justifyContent: 'center' },
  
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  locationText: { fontSize: 10, fontWeight: '700', color: theme.textSub, textTransform: 'uppercase' },

  addCard: { aspectRatio: 3/4, backgroundColor: 'transparent', borderRadius: 24, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: 16 },
  addIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.surfaceLight, alignItems: 'center', justifyContent: 'center', shadowColor: theme.accentPurple, shadowOpacity: 0.1, shadowRadius: 10 },
  addCardTitle: { fontSize: 16, fontWeight: '800', color: theme.textMain },
  addCardSubtitle: { fontSize: 12, color: theme.textSub },

  fab: { position: 'absolute', bottom: 32, right: 24, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.accentPurple, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 20, shadowColor: theme.accentPurple, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: {width: 0, height: 8} },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  
  chatFab: { position: 'absolute', width: 56, height: 56, borderRadius: 28, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', shadowColor: theme.primary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width: 0, height: 4} },
});