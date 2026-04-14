import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { FOOD_CATEGORIES } from '../constants/data';
import { Restaurant } from '../types';
import { fetchRestaurants, seedDatabase } from '../services/databaseService';
import { createOrder } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import BarangaySelector from '../components/ui/BarangaySelector';

const { width } = Dimensions.get('window');

export default function FoodDeliveryScreen({ navigation }: any) {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState(0);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dropoff, setDropoff] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    setLoading(true);
    const data = await fetchRestaurants();
    setRestaurants(data);
    setLoading(false);
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    const success = await seedDatabase();
    if (success) {
      Alert.alert('Success', 'Database populated!');
      await loadRestaurants();
    } else {
      Alert.alert('Error', 'Failed to seed database');
    }
    setIsSeeding(false);
  };

  const handleOrderFood = (res: Restaurant) => {
    Alert.alert(
      "Confirm Order",
      `Would you like to order the Chef's Special from ${res.name} for ₱350.00?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Place Order",
          onPress: async () => {
            if (!user) {
              Alert.alert('Error', 'Please log in first.');
              return;
            }
            if (!dropoff) {
              Alert.alert('Missing Dropoff', 'Please select a dropoff barangay at the top of the screen first.');
              return;
            }
            try {
              const orderId = await createOrder({
                userId: user.uid,
                type: 'food',
                pickupLocation: res.name,
                dropoffLocation: `${dropoff}, Butuan City`,
                price: 35.00,
                itemDetails: `Chef's Special - ${res.name}`,
                customerCity: user.location?.city || '',
                customerProvince: user.location?.province || '',
              });
              navigation.navigate('TrackingDetail', { orderId });
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <Text style={styles.title}>
          Craving <Text style={styles.highlight}>something</Text> special?
        </Text>

        <View style={{ marginBottom: SPACING.xl }}>
          <BarangaySelector
            label="DELIVERING TO (BUTUAN CITY)"
            value={dropoff}
            onSelect={setDropoff}
            placeholder="Select your destination barangay"
            icon="location"
          />
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={`${COLORS.onSurfaceVariant}80`} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cuisines or restaurants"
            placeholderTextColor={`${COLORS.onSurfaceVariant}60`}
          />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {FOOD_CATEGORIES.map((cat, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.categoryChip,
                i === activeCategory && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(i)}
            >
              <Text
                style={[
                  styles.categoryText,
                  i === activeCategory && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionLabel}>CURATED CHOICE</Text>
            <Text style={styles.sectionTitle}>Featured Flavors</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Card */}
        <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop' }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.featuredGradient}
          />
          <View style={styles.featuredContent}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>TOP RATED</Text>
            </View>
            <Text style={styles.featuredName}>The Artisan Hearth</Text>
            <Text style={styles.featuredDesc}>
              Gourmet wood-fired pizzas and seasonal organic salads.
            </Text>
            <View style={styles.featuredMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="star" size={14} color={COLORS.white} />
                <Text style={styles.metaText}>4.9</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={COLORS.white} />
                <Text style={styles.metaText}>20-30 min</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Promo Cards */}
        <View style={styles.promoRow}>
          <View style={[styles.promoCard, { backgroundColor: COLORS.secondaryContainer }]}>
            <Text style={styles.promoTitle}>Zero Delivery Fees</Text>
            <Text style={styles.promoDesc}>Order over ₱350 from select healthy kitchens.</Text>
            <Button
              title="Claim"
              onPress={() => { }}
              size="sm"
              style={{ alignSelf: 'flex-start', marginTop: 8 }}
            />
          </View>
          <View style={[styles.promoCard, { backgroundColor: COLORS.surfaceHighest }]}>
            <Text style={styles.promoTitle}>Weekend Specials</Text>
            <Text style={styles.promoDesc}>Desserts up to 50% off this Sat & Sun.</Text>
            <Button
              title="See List"
              onPress={() => { }}
              size="sm"
              style={{ alignSelf: 'flex-start', marginTop: 8 }}
            />
          </View>
        </View>

        {/* Restaurant List */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionLabel}>COMMUNITY FAVORITES</Text>
            <Text style={styles.sectionTitle}>Popular Near You</Text>
          </View>
        </View>

        {restaurants.length === 0 && !loading && (
          <View style={{ padding: SPACING.xl, alignItems: 'center', backgroundColor: COLORS.surfaceLow, borderRadius: RADIUS.lg, marginBottom: SPACING.xl }}>
            <Ionicons name="server" size={40} color={COLORS.primary} style={{ marginBottom: 10 }} />
            <Text style={{ textAlign: 'center', marginBottom: SPACING.lg, color: COLORS.onSurfaceVariant, fontSize: 13 }}>
              Your Firestore database is currently empty. Click below to instantly upload all our mock restaurants to your live database!
            </Text>
            <Button
              title={isSeeding ? "Uploading to Firebase..." : "Seed Firebase Database"}
              onPress={handleSeed}
              loading={isSeeding}
            />
          </View>
        )}

        {loading && (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: SPACING.xl }} />
        )}

        {restaurants.map((res) => (
          <TouchableOpacity key={res.id} style={styles.restaurantCard} activeOpacity={0.9} onPress={() => handleOrderFood(res)}>
            <View style={styles.restaurantImageContainer}>
              <Image source={{ uri: res.image }} style={styles.restaurantImage} resizeMode="cover" />
              {/* Rating Badge */}
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={10} color={COLORS.primary} />
                <Text style={styles.ratingText}>{res.rating}</Text>
              </View>
              {/* Free Delivery Badge */}
              {res.isFreeDelivery && (
                <View style={styles.freeDeliveryBadge}>
                  <Text style={styles.freeDeliveryText}>FREE DELIVERY</Text>
                </View>
              )}
              {/* Staff Pick Badge */}
              {res.isStaffPick && (
                <View style={styles.staffPickBadge}>
                  <Text style={styles.staffPickText}>STAFF PICK</Text>
                </View>
              )}
            </View>
            <View style={styles.restaurantInfo}>
              <View style={{ flex: 1 }}>
                <Text style={styles.restaurantName}>{res.name}</Text>
                <Text style={styles.restaurantCuisine}>{res.cuisine.join(' • ')}</Text>
              </View>
              <View style={styles.restaurantRight}>
                <Text style={styles.restaurantTime}>{res.deliveryTime}</Text>
                <Text style={styles.restaurantStatus}>
                  {res.status || res.deliveryFee}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 100,
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
    marginBottom: SPACING.lg,
    lineHeight: 38,
  },
  highlight: {
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: SPACING.xl,
    gap: 8,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  categoryScroll: {
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceHigh,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  categoryTextActive: {
    color: COLORS.white,
    fontWeight: '700',
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
    letterSpacing: 3,
    color: COLORS.primary,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  featuredCard: {
    height: 280,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
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
    height: '80%',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.xl,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: 8,
  },
  featuredBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 2,
  },
  featuredName: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  featuredDesc: {
    fontSize: 13,
    color: `${COLORS.white}CC`,
    marginBottom: 10,
    maxWidth: '85%',
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  promoRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  promoCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    minHeight: 150,
    justifyContent: 'space-between',
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  promoDesc: {
    fontSize: 12,
    color: `${COLORS.onSurface}AA`,
    lineHeight: 17,
  },
  restaurantCard: {
    marginBottom: SPACING.xl,
  },
  restaurantImageContainer: {
    height: 160,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${COLORS.white}EE`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    ...SHADOWS.sm,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  freeDeliveryBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: `${COLORS.onSurface}BB`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  freeDeliveryText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 2,
  },
  staffPickBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  staffPickText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
  },
  restaurantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  restaurantCuisine: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
    marginTop: 2,
  },
  restaurantRight: {
    alignItems: 'flex-end',
  },
  restaurantTime: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  restaurantStatus: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.outlineVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});
