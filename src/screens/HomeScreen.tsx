import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserOrders, Order } from '../services/orderService';

const { width } = Dimensions.get('window');

const serviceCards = [
  {
    id: 'food',
    title: 'Order Food',
    subtitle: 'Hungry? Get your favorite meals delivered in minutes.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
    cta: 'Explore Restaurants',
    screen: 'FoodDelivery',
    large: true,
  },
  {
    id: 'pabili',
    title: 'Pa-bili',
    subtitle: 'Tell a rider what to buy from any store in Butuan!',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&h=400&fit=crop',
    cta: 'Browse Stores',
    screen: 'StoreDirectory',
    large: true,
  },
  {
    id: 'ride',
    title: 'Book Ride',
    subtitle: 'Premium rides for your daily commute.',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop',
    cta: 'Call Driver',
    screen: 'RideSelection',
  },
  {
    id: 'parcel',
    title: 'Send Parcel',
    subtitle: 'Fast & reliable courier service.',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=400&fit=crop',
    cta: 'Start Shipping',
    screen: 'ParcelDelivery',
  },
];

const offers = [
  { title: 'First Ride\nDiscount', off: '50% OFF', color: `${COLORS.primary}15`, textColor: COLORS.primary, valid: 'Valid for 3 days' },
  { title: 'Zero Delivery\non Burgers', off: 'FREE', color: `${COLORS.secondary}15`, textColor: COLORS.secondary, valid: 'Ends tonight' },
  { title: 'Pabili Bonus\n₱0 Service Fee', off: 'NEW!', color: `${COLORS.tertiary}15`, textColor: COLORS.tertiary, valid: 'First 3 orders' },
];

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToUserOrders(user.uid, (orders) => {
      setRecentOrders(orders.slice(0, 3));
    });
    return () => unsub();
  }, [user]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingLabel}>GOOD MORNING, {user?.name.toUpperCase() || 'USER'}</Text>
          <Text style={styles.greetingTitle}>
            Where can we <Text style={styles.highlight}>fetch</Text> for you today?
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={22} color={`${COLORS.onSurfaceVariant}80`} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for stores, food, or services..."
            placeholderTextColor={`${COLORS.onSurfaceVariant}60`}
          />
        </View>

        {/* Service Cards */}
        <View style={styles.servicesGrid}>
          {serviceCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[styles.serviceCard, card.large && styles.serviceCardLarge]}
              activeOpacity={0.9}
              onPress={() => card.screen && navigation.navigate(card.screen)}
            >
              <Image source={{ uri: card.image }} style={styles.serviceImage} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.75)']}
                style={styles.serviceGradient}
              />
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>{card.title}</Text>
                <Text style={styles.serviceSubtitle}>{card.subtitle}</Text>
                <View style={styles.serviceCta}>
                  <Text style={styles.serviceCtaText}>{card.cta}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Store Directory Banner */}
        <TouchableOpacity 
          style={styles.groceryBanner} 
          activeOpacity={0.85}
          onPress={() => navigation.navigate('StoreDirectory')}
        >
          <View style={styles.groceryContent}>
            <Text style={styles.groceryTitle}>🏪 Butuan Store Directory</Text>
            <Text style={styles.grocerySubtitle}>
              Browse all stores in Butuan City — groceries, pharmacies, hardware, and more. Find what you need!
            </Text>
          </View>
          <View style={styles.groceryIconContainer}>
            <Ionicons name="arrow-forward-circle" size={36} color={COLORS.tertiary} />
          </View>
        </TouchableOpacity>

        {/* Special Offers */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <Text style={styles.sectionSubtitle}>Curated deals just for you</Text>
          </View>
          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View all</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.offersScroll}
        >
          {offers.map((offer, i) => (
            <View key={i} style={[styles.offerCard, { backgroundColor: offer.color }]}>
              <View style={styles.offerBadge}>
                <LinearGradient
                  colors={[offer.textColor, `${offer.textColor}CC`]}
                  style={styles.offerBadgeGradient}
                >
                  <Text style={styles.offerBadgeText}>{offer.off}</Text>
                </LinearGradient>
              </View>
              <Text style={styles.offerTitle}>{offer.title}</Text>
              <Text style={[styles.offerValid, { color: offer.textColor }]}>{offer.valid}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Recent Activity */}
        <Text style={styles.sectionTitleOnly}>Recent Activity</Text>

        {recentOrders.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Ionicons name="receipt-outline" size={32} color={`${COLORS.onSurface}40`} />
            <Text style={{ marginTop: 10, color: COLORS.onSurfaceVariant }}>No recent activities yet</Text>
          </View>
        ) : (
          recentOrders.map((order, index) => {
            let iconName = 'cart';
            let color = COLORS.primary;
            let displayTitle = 'Pabili Order';
            
            if (order.serviceType === 'food') {
              iconName = 'restaurant';
              displayTitle = 'Food Delivery';
            } else if (order.serviceType === 'ride') {
              iconName = 'car';
              color = COLORS.secondary;
              displayTitle = `Ride to ${order.dropoffLocation}`;
            } else if (order.serviceType === 'parcel') {
              iconName = 'cube';
              color = COLORS.tertiary;
              displayTitle = 'Parcel Delivery';
            }

            const dateLabel = order.createdAt?.toDate 
              ? order.createdAt.toDate().toLocaleDateString() 
              : 'Recently';

            return (
              <View key={order.id || index} style={styles.activityCard}>
                <View style={[styles.activityIcon, { backgroundColor: `${COLORS.surfaceHighest}` }]}>
                  <Ionicons name={iconName as any} size={22} color={color} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityName} numberOfLines={1}>{displayTitle}</Text>
                  <Text style={styles.activityMeta}>{order.status.toUpperCase()} • {dateLabel}</Text>
                </View>
                <View style={styles.activityPrice}>
                  <Text style={styles.activityAmount}>
                    {order.price ? `₱${order.price.toFixed(2)}` : '₱---'}
                  </Text>
                  <Text style={[styles.activityReorder, { color: color }]}>VIEW</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 100,
    paddingHorizontal: SPACING.xl,
  },
  greeting: {
    marginBottom: SPACING.xl,
  },
  greetingLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    color: COLORS.primary,
    marginBottom: 4,
  },
  greetingTitle: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: COLORS.onSurface,
    lineHeight: 36,
  },
  highlight: {
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    height: 56,
    marginBottom: SPACING.xxl,
    ...SHADOWS.sm,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  servicesGrid: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  serviceCard: {
    height: 180,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  serviceCardLarge: {
    height: 200,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  serviceGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
  },
  serviceContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.xl,
  },
  serviceTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 13,
    color: `${COLORS.white}CC`,
    fontWeight: '500',
    marginBottom: 12,
    maxWidth: '80%',
  },
  serviceCta: {
    alignSelf: 'flex-start',
    backgroundColor: `${COLORS.white}25`,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  serviceCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  groceryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${COLORS.tertiary}10`,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.xxl,
    overflow: 'hidden',
  },
  groceryContent: {
    flex: 1,
    marginRight: 16,
  },
  groceryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.tertiary,
    marginBottom: 4,
  },
  grocerySubtitle: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
    lineHeight: 19,
  },
  groceryIconContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: COLORS.onSurface,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  sectionTitleOnly: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: COLORS.onSurface,
    marginBottom: SPACING.lg,
    marginTop: SPACING.xl,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  offersScroll: {
    paddingRight: SPACING.xl,
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  offerCard: {
    width: width * 0.7,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    height: 160,
    justifyContent: 'space-between',
  },
  offerBadge: {
    alignSelf: 'flex-start',
  },
  offerBadgeGradient: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  offerBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 2,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    lineHeight: 24,
  },
  offerValid: {
    fontSize: 11,
    fontWeight: '600',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  activityMeta: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
    marginTop: 2,
  },
  activityPrice: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
  },
  activityReorder: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: 2,
    marginTop: 4,
  },
});
