import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/components/ui/design-system';

const FILTERS = [
  { title: 'Light', options: ['Low Light', 'Indirect Light', 'Bright Direct'] },
  { title: 'Pet Friendly', options: ['Safe for Cats & Dogs', 'Toxic if Ingested'] },
  { title: 'Difficulty', options: ['Beginner', 'Intermediate', 'Expert'] },
];

const DISCOVER_PLANTS = [
  {
    id: '1',
    name: 'Snake Plant',
    scientificName: 'Sansevieria trifasciata',
    difficulty: 'Easy',
    light: 'Low Light',
    toxic: 'Toxic',
    image: 'https://images.unsplash.com/photo-1599598425947-73e0e2d7d73d?q=80&w=2581&auto=format&fit=crop',
    price: '$45',
    shop: 'The Sill',
    description: 'Ideally suited for beginners. This architectural beauty thrives on...'
  },
  {
    id: '2',
    name: 'Monstera',
    scientificName: 'Monstera deliciosa',
    difficulty: 'Moderate',
    light: 'Bright Indirect',
    toxic: 'Toxic',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=2664&auto=format&fit=crop',
    price: '$65',
    shop: 'Horti',
    description: 'The "Swiss Cheese Plant" makes a big statement with its fenestrated...'
  },
  {
    id: '3',
    name: 'Spider Plant',
    scientificName: 'Chlorophytum comosum',
    difficulty: 'Easy',
    light: 'Any Light',
    toxic: 'Pet Safe',
    image: 'https://images.unsplash.com/photo-1597055181300-e30ba1546d27?q=80&w=2787&auto=format&fit=crop',
    price: '$25',
    shop: 'Bloomscape',
    description: 'A resilient classic that produces "babies" you can propagate easily...'
  }
];

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const PlantCard = ({ plant }: { plant: any }) => (
    <View style={styles.card}>
      <View style={styles.imageBox}>
        <Image source={{ uri: plant.image }} style={styles.cardImage} contentFit="cover" />
        <View style={styles.difficultyBadge}>
          <View style={[styles.diffDot, { backgroundColor: plant.difficulty === 'Easy' ? '#10b981' : '#f59e0b' }]} />
          <Text style={styles.diffText}>{plant.difficulty}</Text>
        </View>
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{plant.name}</Text>
        <Text style={styles.cardScientific}>{plant.scientificName}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{plant.description}</Text>

        <View style={styles.cardTags}>
          <View style={styles.tag}>
            <IconSymbol name="sun.max.fill" size={10} color="#f59e0b" />
            <Text style={styles.tagText}>{plant.light}</Text>
          </View>
          <View style={styles.tag}>
            <IconSymbol name="pawprint.fill" size={10} color={plant.toxic === 'Pet Safe' ? '#10b981' : '#f43f5e'} />
            <Text style={styles.tagText}>{plant.toxic}</Text>
          </View>
        </View>

        <View style={styles.shopSection}>
          <Text style={styles.shopLabel}>WHERE TO BUY</Text>
          <View style={styles.shopButtons}>
            <Pressable style={styles.shopBtn}>
              <Text style={styles.shopBtnText}>{plant.shop}</Text>
              <IconSymbol name="arrow.up.right" size={12} color="#06b6d4" />
            </Pressable>
            <Pressable style={styles.amazonBtn}>
              <Text style={styles.amazonBtnText}>Amazon</Text>
              <IconSymbol name="arrow.up.right" size={12} color="#f59e0b" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenContainer edges={['top']} containerClassName="bg-[#f8fafc]">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.mainLayout}>
          {/* Sidebar Filters (Web only) */}
          {Platform.OS === 'web' && (
            <View style={styles.sidebar}>
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>Filters</Text>
                <Pressable><Text style={styles.resetText}>Reset All</Text></Pressable>
              </View>

              {FILTERS.map((filter, i) => (
                <View key={i} style={styles.filterGroup}>
                  <View style={styles.filterHeader}>
                    <Text style={styles.filterTitle}>{filter.title}</Text>
                    <IconSymbol name="chevron.up" size={14} color="#94a3b8" />
                  </View>
                  {filter.options.map((opt, j) => (
                    <View key={j} style={styles.filterOption}>
                      <View style={styles.checkbox} />
                      <Text style={styles.optionText}>{opt}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Main Content */}
          <View style={styles.content}>
            <View style={styles.heroHeader}>
              <View>
                <Text style={styles.mainTitle}>Discover New Greenery</Text>
                <Text style={styles.mainSubtitle}>Curated recommendations for your unique space and lifestyle.</Text>
              </View>
              <View style={styles.searchBar}>
                <IconSymbol name="magnifyingglass" size={18} color="#94a3b8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search for 'Monstera'..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* Active Filter Pills */}
            <View style={styles.pillsRow}>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>Pet Friendly</Text>
                <IconSymbol name="xmark" size={12} color="#fff" />
              </View>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>Low Light</Text>
                <IconSymbol name="xmark" size={12} color="#fff" />
              </View>
              <Pressable><Text style={styles.clearAll}>Clear all</Text></Pressable>
            </View>

            {/* Grid */}
            <View style={styles.grid}>
              {DISCOVER_PLANTS.map(plant => (
                <View key={plant.id} style={styles.gridCell}>
                  <PlantCard plant={plant} />
                </View>
              ))}
            </View>

            <Pressable style={styles.loadMore}>
              <Text style={styles.loadMoreText}>Load More Plants</Text>
            </Pressable>
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    maxWidth: 1400,
    width: '100%',
    marginHorizontal: 'auto',
  },
  mainLayout: {
    flexDirection: 'row',
    padding: 32,
    gap: 40,
  },
  sidebar: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    height: 'fit-content' as any,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  resetText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#06b6d4',
  },
  filterGroup: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 24,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    fontFamily: 'PlusJakartaSans-ExtraBold',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  optionText: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Medium',
  },

  content: {
    flex: 1,
  },
  heroHeader: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    marginBottom: 32,
    gap: 24,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
    letterSpacing: -1,
  },
  mainSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Medium',
    marginTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: Platform.OS === 'web' ? 400 : '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Medium',
    // @ts-ignore
    outlineStyle: 'none',
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#06b6d4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  activePillText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  clearAll: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
    marginLeft: 8,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -12,
  },
  gridCell: {
    width: Platform.OS === 'web' ? '33.33%' : '50%',
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f8fafc',
  },
  imageBox: {
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  diffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  diffText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  cardInfo: {
    gap: 6,
  },
  cardName: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#1e293b',
  },
  cardScientific: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#94a3b8',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Medium',
    marginBottom: 16,
  },
  cardTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  shopSection: {
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  shopLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  shopButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  shopBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ecfeff',
    paddingVertical: 12,
    borderRadius: 14,
  },
  shopBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#06b6d4',
  },
  amazonBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fffbeb',
    paddingVertical: 12,
    borderRadius: 14,
  },
  amazonBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#f59e0b',
  },
  loadMore: {
    marginTop: 48,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#06b6d4',
  },
  loadMoreText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#06b6d4',
  },
} as any);
