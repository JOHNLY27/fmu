import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserOrders, Order } from '../services/orderService';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const superServices = [
  { id: 'ride', title: 'Ride', icon: 'car-sport', color: '#FF7A2C', screen: 'RideSelection', desc: 'Secure travel' },
  { id: 'food', title: 'Food', icon: 'fast-food', color: '#4953AC', screen: 'FoodDelivery', desc: 'Premium eats' },
  { id: 'pabili', title: 'Pabili', icon: 'bag-handle', color: '#00C853', screen: 'StoreDirectory', desc: 'Personal shopper' },
  { id: 'parcel', title: 'Parcel', icon: 'cube', color: '#6200EA', screen: 'ParcelDelivery', desc: 'Fast courier' },
];

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // 1. Live subscribe to merchants (Active Only)
    const q = query(
      collection(db, 'merchants'),
      where('isArchived', '==', false)
    );
    const unsubMerchants = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory to avoid needing a Firestore composite index
      const sorted = data.sort((a: any, b: any) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setMerchants(sorted.slice(0, 10));
    });

    // 2. Orders Sync
    let unsubOrders = () => { };
    if (user?.uid) {
      unsubOrders = subscribeToUserOrders(user.uid, (orders) => {
        setRecentOrders(orders.slice(0, 4));
      });
    }

    // 3. Animations
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
    ]).start();

    return () => {
      unsubMerchants();
      unsubOrders();
    };
  }, [user]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* Header & Greeting */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greetingText}>What can we fetch for you,</Text>
              <Text style={styles.userName}>{user?.name || 'Guest'}?</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.notiBtn} onPress={() => navigation.navigate('Notifications')}>
                <Ionicons name="notifications-outline" size={24} color={COLORS.onSurface} />
                <View style={styles.notiBadge} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Account')}>
                <View style={styles.avatar}>
                  {user?.photoURL ? (
                    <Image source={{ uri: user.photoURL }} style={styles.avatarImg} />
                  ) : (
                    <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Kinetic Search Bar */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.searchContainer}
            onPress={() => navigation.navigate('StoreDirectory')}
          >
            <Ionicons name="search" size={20} color="rgba(0,0,0,0.3)" />
            <Text style={styles.searchPlaceholder}>Search for restaurants or stores in Butuan...</Text>
            <View style={styles.searchFilter}>
              <Ionicons name="options-outline" size={18} color={COLORS.white} />
            </View>
          </TouchableOpacity>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Main Service Grid */}
          <View style={styles.servicesGrid}>
            {superServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceBox}
                onPress={() => navigation.navigate(service.screen)}
              >
                <LinearGradient
                  colors={[service.color, `${service.color}CC`]}
                  style={styles.iconCircle}
                >
                  <Ionicons name={service.icon as any} size={24} color={COLORS.white} />
                </LinearGradient>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDesc}>{service.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Premium Promotions */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promoScroll}
            snapToInterval={width * 0.85 + 16}
            decelerationRate="fast"
          >
            <TouchableOpacity style={styles.promoCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&fit=crop' }}
                style={styles.promoImage}
              />
              <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']} style={styles.promoOverlay} />
              <View style={styles.promoContent}>
                <View style={styles.promoBadge}><Text style={styles.promoBadgeText}>FEATURED</Text></View>
                <Text style={styles.promoTitle}>Fetch Plus Premiere</Text>
                <Text style={styles.promoSub}>Zero delivery fees on all restaurant orders today.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.promoCard, { backgroundColor: COLORS.onSurface }]}>
              <View style={styles.cryptoBox}>
                <Ionicons name="star" size={40} color={COLORS.primaryLight} />
              </View>
              <View style={styles.promoContent}>
                <Text style={[styles.promoTitle, { color: COLORS.white }]}>Earn 2x Points</Text>
                <Text style={[styles.promoSub, { color: 'rgba(255,255,255,0.6)' }]}>Points are doubled for all Pabili requests this weekend.</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Location Context Banner */}
          <View style={styles.locationBanner}>
            <View style={styles.locIconBox}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locLabel}>DELIVERING TO</Text>
              <Text style={styles.locValue} numberOfLines={1}>{user?.location?.barangay ? `${user.location.barangay}, ` : ''}{user?.location?.city || 'Butuan City'}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileEdit')}>
              <Text style={styles.changeBtn}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Live Pabili Quick Access */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>EXPLORE BUTUAN</Text>
            <TouchableOpacity onPress={() => navigation.navigate('StoreDirectory')}>
              <Text style={styles.seeAll}>See Directory</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storesScroll}>
            {merchants.length > 0 ? merchants.slice(0, 8).map((store, i) => (
              <TouchableOpacity key={store.id || i} style={styles.storeCard} onPress={() => navigation.navigate('StoreDirectory')}>
                <Image source={{ uri: store.image || 'https://via.placeholder.com/400x300?text=FetchMeUp' }} style={styles.storeImg} />
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <Text style={styles.storeType}>{store.category}</Text>
                </View>
              </TouchableOpacity>
            )) : (
              [1, 2, 3].map(i => (
                <View key={i} style={[styles.storeCard, { backgroundColor: '#F1F3F5', height: 160 }]} />
              ))
            )}
          </ScrollView>

          {/* Activity Feed */}
          {recentOrders.length > 0 && (
            <View style={{ marginTop: 32 }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>RECENT EXPERIENCE</Text>
              </View>
              {recentOrders.map((order, i) => (
                <TouchableOpacity key={i} style={styles.activityItem} onPress={() => navigation.navigate('TrackingDetail', { orderId: order.id })}>
                  <View style={styles.activityIconBox}>
                    <Ionicons
                      name={order.serviceType === 'food' ? 'restaurant' : order.serviceType === 'ride' ? 'car' : 'cube'}
                      size={20} color={COLORS.onSurface}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityTitle}>{(order.serviceType || 'Fetch').toUpperCase()} SUCCESSFUL</Text>
                    <Text style={styles.activityDate}>Completed • {new Date(typeof order.createdAt === 'string' ? order.createdAt : (order.createdAt.seconds * 1000)).toLocaleDateString()}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(0,0,0,0.2)" />
                </TouchableOpacity>
              ))}
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.4)',
  },
  userName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 20,
    gap: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(0,0,0,0.3)',
    fontWeight: '600',
  },
  searchFilter: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.onSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    justifyContent: 'center',
    marginBottom: 32,
  },
  serviceBox: {
    width: (width - 44) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 20,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: '#F8F9FA',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  serviceDesc: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '600',
    marginTop: 4,
  },
  promoScroll: {
    paddingLeft: 24,
    paddingRight: 10,
    marginBottom: 32,
  },
  promoCard: {
    width: width * 0.85,
    height: 180,
    borderRadius: 32,
    marginRight: 16,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  promoImage: {
    ...StyleSheet.absoluteFillObject,
  },
  promoOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  promoContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  promoBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  promoBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.white,
  },
  promoSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    fontWeight: '500',
  },
  cryptoBox: {
    position: 'absolute',
    top: 24,
    right: 24,
    opacity: 0.3,
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 22,
    gap: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  locIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.3)',
    letterSpacing: 1,
    marginBottom: 2,
  },
  locValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  changeBtn: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    paddingHorizontal: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: 'rgba(0,0,0,0.3)',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  storesScroll: {
    paddingLeft: 24,
    paddingRight: 10,
    marginBottom: 40,
  },
  storeCard: {
    width: 160,
    marginRight: 16,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: '#F8F9FA',
  },
  storeImg: {
    width: '100%',
    height: 100,
  },
  storeInfo: {
    padding: 12,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  storeType: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 2,
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  activityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: 0.5,
  },
  activityDate: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 2,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notiBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  notiBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
});
