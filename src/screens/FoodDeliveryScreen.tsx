import React, { useState, useEffect, useRef } from 'react';
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
import BarangaySelector from '../components/ui/BarangaySelector';

const { width } = Dimensions.get('window');

const categoryIcons = [
  { name: 'All', icon: 'apps' },
  { name: 'Pizza', icon: 'pizza' },
  { name: 'Burger', icon: 'fast-food' },
  { name: 'Sushi', icon: 'fish' },
  { name: 'Healthy', icon: 'leaf' },
  { name: 'Coffee', icon: 'cafe' },
  { name: 'Dessert', icon: 'ice-cream' },
];

export default function FoodDeliveryScreen({ navigation }: any) {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dropoff, setDropoff] = useState('');
  const [loading, setLoading] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadRestaurants();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadRestaurants = async () => {
    setLoading(true);
    const data = await fetchRestaurants();
    setRestaurants(data);
    setLoading(false);
  };

  const handleOrderFood = (res: Restaurant) => {
    if (!dropoff) {
      Alert.alert('Coordinate Required', 'Where should we fetch this culinary delight? Set your dropoff point at the top.');
      return;
    }
    
    Alert.alert(
      "Secure Culinary Fetch",
      `Initiate high-priority delivery from ${res.name}?`,
      [
        { text: "Scout More", style: "cancel" },
        {
          text: "Confirm Fetch",
          onPress: async () => {
            try {
              const orderId = await createOrder({
                userId: user?.uid || '',
                type: 'food',
                pickupLocation: res.name,
                dropoffLocation: `${dropoff}, Butuan`,
                price: 35.00,
                itemDetails: `Premium Selection • ${res.name}`,
                customerCity: user?.location?.city || 'Butuan',
                customerProvince: user?.location?.province || 'Agusan del Norte',
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
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* Search Header */}
      <View style={styles.header}>
         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
         </TouchableOpacity>
         <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="rgba(0,0,0,0.2)" />
            <TextInput 
              placeholder="Cuisines, dishes, or kitchens..." 
              style={styles.searchInput}
              placeholderTextColor="rgba(0,0,0,0.3)"
            />
         </View>
         <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={22} color={COLORS.primary} />
         </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Dynamic Context */}
        <View style={styles.contextPanel}>
            <View style={styles.contextIcon}>
               <Ionicons name="location" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
               <BarangaySelector 
                  value={dropoff} 
                  onSelect={setDropoff} 
                  placeholder="Set Delivery Coordinates"
                  variant="minimal"
               />
               <Text style={styles.contextSub}>Current delivery dropoff in Butuan City</Text>
            </View>
        </View>

        {/* Feature Hero */}
        <TouchableOpacity style={styles.heroCard} activeOpacity={0.95}>
           <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800' }} 
            style={styles.heroImg} 
           />
           <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.heroOverlay} />
           <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>CHEF'S PICK</Text>
           </View>
           <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Golden Hour Feast</Text>
              <Text style={styles.heroSub}>Premium kitchens offering 25% off until 6 PM</Text>
           </View>
        </TouchableOpacity>

        {/* Cuisine Wheel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cuisineWheel}>
           {categoryIcons.map((cat, i) => (
              <TouchableOpacity 
                key={i} 
                style={[styles.cuisineCard, activeCategory === cat.name && styles.activeCuisine]}
                onPress={() => setActiveCategory(cat.name)}
              >
                 <View style={[styles.cuisineIconBox, activeCategory === cat.name && styles.activeIconBox]}>
                    <Ionicons name={cat.icon as any} size={24} color={activeCategory === cat.name ? COLORS.white : 'rgba(0,0,0,0.4)'} />
                 </View>
                 <Text style={[styles.cuisineText, activeCategory === cat.name && styles.activeCuisineText]}>{cat.name}</Text>
              </TouchableOpacity>
           ))}
        </ScrollView>

        {/* Section Heading */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>ELITE KITCHENS</Text>
           <TouchableOpacity><Text style={styles.viewAll}>VIEW ALL</Text></TouchableOpacity>
        </View>

        {loading ? (
           <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
           <>
           <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              {restaurants.map((res) => (
                 <TouchableOpacity 
                  key={res.id} 
                  style={styles.resCard} 
                  onPress={() => handleOrderFood(res)}
                  activeOpacity={0.9}
                 >
                    <Image 
                      source={{ uri: res.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' }} 
                      style={styles.resImg} 
                    />
                    <View style={styles.resOverlay}>
                       <View style={styles.resRating}>
                          <Ionicons name="star" size={10} color={COLORS.tertiary} />
                          <Text style={styles.ratingVal}>{res.rating}</Text>
                       </View>
                       {res.isFreeDelivery && (
                          <View style={styles.freeBadge}><Text style={styles.freeText}>FREE</Text></View>
                       )}
                    </View>
                    <View style={styles.resInfo}>
                       <View style={{ flex: 1 }}>
                          <Text style={styles.resName}>{res.name}</Text>
                          <Text style={styles.resTags}>{res.cuisine.slice(0, 2).join(' • ')}</Text>
                       </View>
                       <View style={styles.resMeta}>
                          <Text style={styles.resTime}>{res.deliveryTime}</Text>
                          <Text style={styles.resFee}>{res.deliveryFee === 0 ? 'WAVIED' : `₱${res.deliveryFee}`}</Text>
                       </View>
                    </View>
                 </TouchableOpacity>
              ))}
           </Animated.View>
           
           {/* Admin Sync Command */}
           <TouchableOpacity 
              style={styles.syncBtn} 
              onPress={async () => {
                 const success = await seedDatabase();
                 if (success) {
                    Alert.alert('Database Synced', 'Latest hardened brand assets have been deployed to Firestore.');
                    loadRestaurants();
                 } else {
                    Alert.alert('System Error', 'Failed to synchronize assets with Firestore.');
                 }
              }}
           >
              <Ionicons name="cloud-upload-outline" size={16} color={COLORS.primary} />
              <Text style={styles.syncText}>SYNC LATEST BRAND ASSETS</Text>
           </TouchableOpacity>
           </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 44,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  contextPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  contextIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextSub: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.3)',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  heroCard: {
    marginHorizontal: 20,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    ...SHADOWS.md,
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  cuisineWheel: {
    paddingLeft: 20,
    paddingBottom: 32,
    gap: 16,
  },
  cuisineCard: {
    alignItems: 'center',
    gap: 8,
  },
  cuisineIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  activeIconBox: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  cuisineText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.35)',
  },
  activeCuisineText: {
    color: COLORS.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: 'rgba(0,0,0,0.3)',
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  resCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  resImg: {
    width: '100%',
    height: 180,
  },
  resOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingVal: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  freeBadge: {
    backgroundColor: COLORS.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freeText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
  resInfo: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  resTags: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '500',
    marginTop: 2,
  },
  resMeta: {
    alignItems: 'flex-end',
  },
  resTime: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  resFee: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 2,
    letterSpacing: 1,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 40,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}05`,
 },
 syncText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.5,
 },
});
