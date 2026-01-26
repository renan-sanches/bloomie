import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { theme } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIES = ["All", "Indoor", "Outdoor", "Pet Safe", "Low Light", "Rare"];

const TRENDING_PLANTS = [
  {
    id: '1',
    name: 'Monstera Deliciosa',
    price: '$35.00',
    category: 'Indoor',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=2664&auto=format&fit=crop',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Fiddle Leaf Fig',
    price: '$45.00',
    category: 'Indoor',
    image: 'https://images.unsplash.com/photo-1597055181300-e30ba1546d27?q=80&w=2787&auto=format&fit=crop',
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Snake Plant',
    price: '$25.00',
    category: 'Low Light',
    image: 'https://images.unsplash.com/photo-1599598425947-73e0e2d7d73d?q=80&w=2581&auto=format&fit=crop',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Pothos Golden',
    price: '$15.00',
    category: 'Beginner',
    image: 'https://images.unsplash.com/photo-1596724857963-c5c2e268a736?q=80&w=2787&auto=format&fit=crop',
    rating: 4.7,
  },
];

export default function DiscoverScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();

  return (
    <ScreenContainer edges={['top']} containerClassName="bg-backgroundLight">
      {/* Header & Search */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Discover</Text>
            <Text style={styles.headerSubtitle}>Find your perfect plant match</Text>
          </View>
          <Pressable style={styles.cartButton}>
            <IconSymbol name="bag" size={24} color={theme.textMain} />
            <View style={styles.badge} />
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <IconSymbol name="magnifyingglass" size={20} color={theme.textSub} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search plants, pots, tools..."
              placeholderTextColor={theme.textSub}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Pressable style={styles.filterButton}>
            <IconSymbol name="slider.horizontal.3" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Promotional Banner */}
        <View style={styles.promoBanner}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1463320898484-cdee8141c787?q=80&w=2669&auto=format&fit=crop' }}
            style={styles.promoBackground}
            imageStyle={{ borderRadius: 24 }}
          >
            <View style={styles.promoOverlay} />
            <View style={styles.promoContent}>
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>LIMITED OFFER</Text>
              </View>
              <Text style={styles.promoTitle}>Summer Sale</Text>
              <Text style={styles.promoSubtitle}>Get 20% off on all indoor plants</Text>
              <Pressable style={styles.promoButton}>
                <Text style={styles.promoButtonText}>Shop Now</Text>
                <IconSymbol name="arrow.right" size={16} color={theme.primary} />
              </Pressable>
            </View>
          </ImageBackground>
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Text style={styles.seeAllText}>See all</Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoriesList}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.categoryPill,
                activeCategory === cat && styles.categoryPillActive
              ]}
            >
              <Text 
                style={[
                  styles.categoryText, 
                  activeCategory === cat && styles.categoryTextActive
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Trending Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Plants</Text>
        </View>

        <View style={styles.plantsGrid}>
          {TRENDING_PLANTS.map((plant) => (
            <Pressable key={plant.id} style={styles.plantCard}>
              <ImageBackground
                source={{ uri: plant.image }}
                style={styles.plantImage}
                imageStyle={{ borderRadius: 20 }}
              >
                <Pressable style={styles.favoriteButton}>
                  <IconSymbol name="heart" size={18} color="#fff" />
                </Pressable>
              </ImageBackground>
              
              <View style={styles.plantInfo}>
                <View style={styles.plantHeader}>
                  <Text style={styles.plantName}>{plant.name}</Text>
                  <View style={styles.ratingContainer}>
                    <IconSymbol name="star.fill" size={12} color={theme.accentOrange} />
                    <Text style={styles.ratingText}>{plant.rating}</Text>
                  </View>
                </View>
                
                <Text style={styles.plantCategory}>{plant.category}</Text>
                
                <View style={styles.priceRow}>
                  <Text style={styles.plantPrice}>{plant.price}</Text>
                  <Pressable style={styles.addButton}>
                    <IconSymbol name="plus" size={20} color="#fff" />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: theme.backgroundLight,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.textMain,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.textSub,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.accentPink,
    borderWidth: 1,
    borderColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceLight,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.textMain,
  },
  filterButton: {
    width: 52,
    height: 52,
    backgroundColor: theme.textMain, // Dark button for contrast
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  
  // Promo Banner
  promoBanner: {
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  promoBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  promoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  promoContent: {
    padding: 24,
  },
  promoBadge: {
    backgroundColor: theme.accentOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  promoBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  promoButtonText: {
    color: theme.primary,
    fontWeight: '700',
    fontSize: 14,
  },

  // Categories
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textMain,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '600',
  },
  categoriesList: {
    gap: 12,
    paddingRight: 24,
    marginBottom: 32,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryPillActive: {
    backgroundColor: theme.textMain,
    borderColor: theme.textMain,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSub,
  },
  categoryTextActive: {
    color: '#fff',
  },

  // Plants Grid
  plantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  plantCard: {
    width: '50%',
    padding: 8,
    marginBottom: 16,
  },
  plantImage: {
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 20,
    marginBottom: 12,
    padding: 12,
    alignItems: 'flex-end',
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantInfo: {
    paddingHorizontal: 4,
  },
  plantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  plantName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: theme.textMain,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.textMain,
  },
  plantCategory: {
    fontSize: 12,
    color: theme.textSub,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plantPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.primary,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.textMain,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
