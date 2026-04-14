import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { BUTUAN_STORES, STORE_CATEGORIES } from '../constants/butuanStores';
import { Store, StoreCategory } from '../types';

const { width } = Dimensions.get('window');

export default function StoreDirectoryScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<StoreCategory>('All');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredStores = useMemo(() => {
    let stores = BUTUAN_STORES;

    if (activeCategory !== 'All') {
      stores = stores.filter(s => s.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      stores = stores.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q)) ||
        s.barangay.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
      );
    }

    return stores;
  }, [searchQuery, activeCategory]);

  const featuredStores = useMemo(() =>
    BUTUAN_STORES.filter(s => s.isFeatured),
    []);

  const storeCount = useMemo(() => {
    const counts: Partial<Record<StoreCategory, number>> = {};
    BUTUAN_STORES.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, []);

  const renderStoreCard = (store: Store) => (
    <TouchableOpacity
      key={store.id}
      style={styles.storeCard}
      activeOpacity={0.88}
      onPress={() => navigation.navigate('PabiliOrder', { store })}
    >
      <View style={styles.storeImageContainer}>
        <Image source={{ uri: store.image }} style={styles.storeImage} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          style={styles.storeImageGradient}
        />
        {/* Rating */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color="#FFB800" />
          <Text style={styles.ratingText}>{store.rating}</Text>
        </View>
        {/* Open/Closed */}
        <View style={[styles.statusBadge, !store.isOpen && styles.closedBadge]}>
          <View style={[styles.statusDot, !store.isOpen && styles.closedDot]} />
          <Text style={[styles.statusText, !store.isOpen && styles.closedText]}>
            {store.isOpen ? 'Open' : 'Closed'}
          </Text>
        </View>
        {/* Verified */}
        {store.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.white} />
          </View>
        )}
      </View>
      <View style={styles.storeInfo}>
        <View style={styles.storeInfoLeft}>
          <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
          <Text style={styles.storeCategory}>{store.category}</Text>
          <View style={styles.storeLocationRow}>
            <Ionicons name="location-outline" size={12} color={COLORS.onSurfaceVariant} />
            <Text style={styles.storeLocation} numberOfLines={1}>{store.barangay}, Butuan</Text>
          </View>
        </View>
        <View style={styles.pabiliBtn}>
          <Ionicons name="bag-add" size={18} color={COLORS.white} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFeaturedCard = (store: Store) => (
    <TouchableOpacity
      key={store.id}
      style={styles.featuredCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('PabiliOrder', { store })}
    >
      <Image source={{ uri: store.image }} style={styles.featuredImage} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.featuredGradient}
      />
      <View style={styles.featuredContent}>
        <View style={styles.featuredBadgeContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.featuredBadge}
          >
            <Ionicons name="flame" size={10} color={COLORS.white} />
            <Text style={styles.featuredBadgeText}>POPULAR</Text>
          </LinearGradient>
        </View>
        <Text style={styles.featuredName} numberOfLines={1}>{store.name}</Text>
        <Text style={styles.featuredDesc} numberOfLines={2}>{store.description}</Text>
        <View style={styles.featuredMeta}>
          <View style={styles.featuredMetaItem}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <Text style={styles.featuredMetaText}>{store.rating}</Text>
          </View>
          <View style={styles.featuredMetaItem}>
            <Ionicons name="location" size={12} color={COLORS.white} />
            <Text style={styles.featuredMetaText}>{store.barangay}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSubtitle}>BUTUAN CITY</Text>
          <Text style={styles.headerTitle}>Store Directory</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{BUTUAN_STORES.length}</Text>
          <Text style={styles.headerBadgeLabel}>stores</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={`${COLORS.onSurfaceVariant}80`} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stores, products, or barangays..."
            placeholderTextColor={`${COLORS.onSurfaceVariant}50`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Info Banner */}
        <View style={styles.infoBanner}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.infoBannerGradient}
          >
            <View style={styles.infoBannerIcon}>
              <Ionicons name="bag-handle" size={28} color={COLORS.white} />
            </View>
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Pa-bili na! 🛍️</Text>
              <Text style={styles.infoBannerDesc}>
                Pick any store below, tell us what you need, and a rider will buy it for you!
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {STORE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={[
                styles.categoryChip,
                activeCategory === cat.label && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat.label)}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat.label && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
              {cat.label !== 'All' && storeCount[cat.label] && (
                <View style={[
                  styles.categoryCount,
                  activeCategory === cat.label && styles.categoryCountActive
                ]}>
                  <Text style={[
                    styles.categoryCountText,
                    activeCategory === cat.label && styles.categoryCountTextActive,
                  ]}>
                    {storeCount[cat.label]}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Stores (horizontal) — only show when not searching */}
        {!searchQuery && activeCategory === 'All' && (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionLabel}>🔥 HOT PICKS</Text>
                <Text style={styles.sectionTitle}>Featured Stores</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScroll}
            >
              {featuredStores.map(renderFeaturedCard)}
            </ScrollView>
          </>
        )}

        {/* Store Grid */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionLabel}>
              {activeCategory === 'All' ? '📍 ALL STORES' : `${STORE_CATEGORIES.find(c => c.label === activeCategory)?.emoji || ''} ${activeCategory.toUpperCase()}`}
            </Text>
            <Text style={styles.sectionTitle}>
              {searchQuery
                ? `${filteredStores.length} result${filteredStores.length !== 1 ? 's' : ''} found`
                : activeCategory === 'All'
                  ? 'Browse All in Butuan'
                  : `${activeCategory} Stores`}
            </Text>
          </View>
        </View>

        {filteredStores.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={`${COLORS.onSurfaceVariant}40`} />
            <Text style={styles.emptyTitle}>No stores found</Text>
            <Text style={styles.emptyDesc}>
              Try a different search term or category
            </Text>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {filteredStores.map(renderStoreCard)}
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 3,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  headerBadge: {
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  headerBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },
  headerBadgeLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: SPACING.lg,
    gap: 10,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  infoBanner: {
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  infoBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  infoBannerIcon: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 2,
  },
  infoBannerDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    lineHeight: 17,
  },
  categoryScroll: {
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLowest,
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: `${COLORS.primary}12`,
    borderColor: COLORS.primary,
  },
  categoryEmoji: {
    fontSize: 15,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  categoryTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  categoryCount: {
    backgroundColor: `${COLORS.onSurfaceVariant}15`,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.full,
    minWidth: 20,
    alignItems: 'center',
  },
  categoryCountActive: {
    backgroundColor: `${COLORS.primary}20`,
  },
  categoryCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  categoryCountTextActive: {
    color: COLORS.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.primary,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  // Featured cards
  featuredScroll: {
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  featuredCard: {
    width: width * 0.72,
    height: 200,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85%',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
  },
  featuredBadgeContainer: {
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  featuredBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 2,
  },
  featuredName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 2,
  },
  featuredDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    lineHeight: 15,
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredMetaText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  // Store cards
  storeCard: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceLowest,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  storeImageContainer: {
    height: 140,
    overflow: 'hidden',
  },
  storeImage: {
    width: '100%',
    height: '100%',
  },
  storeImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,106,40,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  closedBadge: {
    backgroundColor: 'rgba(186,26,26,0.9)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5cfd80',
  },
  closedDot: {
    backgroundColor: '#ffb4ab',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
  },
  closedText: {
    color: '#ffb4ab',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,106,40,0.85)',
    borderRadius: RADIUS.full,
    padding: 3,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  storeInfoLeft: {
    flex: 1,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  storeCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  storeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  storeLocation: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  pabiliBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.huge,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
});
