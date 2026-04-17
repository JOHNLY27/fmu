import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants/theme';
import { FOOD_CATEGORIES } from '../constants/butuanRestaurants';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function FoodDeliveryScreen({ navigation }: any) {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Animation Trigger
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [activeCategory]);

  useEffect(() => {
    // Live subscribe to merchants from Firestore (Active Only)
    const merchantsRef = collection(db, 'merchants');
    const q = query(merchantsRef, where('isArchived', '==', false));
    
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMerchants(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredRestaurants = activeCategory === 'All'
    ? merchants
    : merchants.filter(r => r.category === activeCategory);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Food Delivery</Text>
          <Text style={styles.headerSub}>Feeding Butuan's Cravings</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Active Session Indicator */}
        <View style={styles.promoCard}>
           <LinearGradient 
              colors={[COLORS.primary, '#E65100']} 
              style={styles.promoGradient}
              start={{x:0, y:0}}
              end={{x:1, y:1}}
           >
              <View style={styles.promoInfo}>
                 <Text style={styles.promoTag}>LIMITED OFFER</Text>
                 <Text style={styles.promoTitle}>Free Delivery</Text>
                 <Text style={styles.promoSub}>On your first Jollibee order today!</Text>
              </View>
              <Image 
                 source={{ uri: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=400' }} 
                 style={styles.promoImg} 
              />
           </LinearGradient>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>
              {activeCategory === 'All' ? 'EXPLORE CUISINES' : `${activeCategory.toUpperCase()}`}
           </Text>
           {activeCategory !== 'All' && (
             <TouchableOpacity onPress={() => setActiveCategory('All')}>
                <Text style={styles.viewAllText}>View All</Text>
             </TouchableOpacity>
           )}
        </View>

        {activeCategory === 'All' ? (
          /* Cuisine Selector Matrix */
          <View style={styles.catMatrix}>
             {FOOD_CATEGORIES.map((cat, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={styles.matrixCard}
                  onPress={() => setActiveCategory(cat.label)}
                  activeOpacity={0.8}
                >
                   <View style={styles.matrixIconBox}>
                      <Text style={styles.matrixEmoji}>{cat.emoji}</Text>
                   </View>
                   <Text style={styles.matrixLabel}>{cat.label}</Text>
                </TouchableOpacity>
             ))}
          </View>
        ) : (
          /* Restaurant Results */
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
             {filteredRestaurants.map((rest) => (
               <TouchableOpacity 
                 key={rest.id} 
                 style={styles.restCard}
                 onPress={() => navigation.navigate('RestaurantMenu', { restaurant: rest })}
                 activeOpacity={0.9}
               >
                  <View style={styles.restImgBox}>
                     <Image source={{ uri: rest.image }} style={styles.restImg} />
                     <View style={styles.restOverlay}>
                        <View style={styles.timeBadge}>
                           <Ionicons name="time" size={10} color={COLORS.white} />
                           <Text style={styles.timeText}>{rest.deliveryTime}</Text>
                        </View>
                     </View>
                  </View>
                  <View style={styles.restDetails}>
                     <View style={styles.restMainRow}>
                        <Text style={styles.restName}>{rest.name}</Text>
                        <View style={styles.ratingBadge}>
                           <Ionicons name="star" size={10} color={COLORS.tertiary} />
                           <Text style={styles.ratingText}>{rest.rating}</Text>
                        </View>
                     </View>
                     <Text style={styles.restMeta}>{rest.category} • ₱{rest.deliveryFee} fee</Text>
                  </View>
               </TouchableOpacity>
             ))}
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
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
    height: 120,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    ...SHADOWS.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.3)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  searchBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 24,
  },
  promoCard: {
    marginHorizontal: 20,
    height: 140,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    ...SHADOWS.md,
  },
  promoGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  promoInfo: {
    flex: 1,
  },
  promoTag: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
    marginVertical: 4,
  },
  promoSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  promoImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: 'rgba(0,0,0,0.25)',
  },
  viewAllText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  catMatrix: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  matrixCard: {
    width: (width - 60) / 2,
    height: 140,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  matrixIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  matrixEmoji: {
    fontSize: 24,
  },
  matrixLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
  },
  restCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginBottom: 20,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  restImgBox: {
    height: 160,
    width: '100%',
  },
  restImg: {
    ...StyleSheet.absoluteFillObject,
  },
  restOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.onSurface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
  },
  restDetails: {
    padding: 16,
  },
  restMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  restMeta: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '600',
    marginTop: 4,
  },
});
