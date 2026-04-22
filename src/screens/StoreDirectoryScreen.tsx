import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { STORE_CATEGORIES } from '../constants/butuanStores';
import { subscribeToActiveMerchants, Merchant } from '../services/merchantService';
import Skeleton from '../components/ui/Skeleton';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

export default function StoreDirectoryScreen({ navigation }: any) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const unsubscribe = subscribeToActiveMerchants((data) => {
      setMerchants(data);
      setLoading(false);
      
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
      ]).start();
    });

    return () => unsubscribe();
  }, []);

  const filteredStores = useMemo(() => {
    let stores = merchants;
    if (activeCategory !== 'All') stores = stores.filter(s => s.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      stores = stores.filter(s => s.name.toLowerCase().includes(q) || (s.barangay || '').toLowerCase().includes(q));
    }
    return stores;
  }, [merchants, searchQuery, activeCategory]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* Premium Header */}
      <View style={styles.header}>
         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
         </TouchableOpacity>
         <View style={styles.headerInfo}>
            <Text style={styles.headerLabel}>URBAN MARKETPLACE</Text>
            <Text style={styles.headerTitle}>Pabili Services</Text>
         </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
         
         {/* Search Interface */}
         <View style={styles.searchBlock}>
            <View style={styles.searchBar}>
               <Ionicons name="search" size={20} color="rgba(0,0,0,0.2)" />
               <TextInput 
                  placeholder="Items, stores, or essentials..." 
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
               />
               <TouchableOpacity style={styles.scanBtn}>
                  <Ionicons name="scan" size={20} color={COLORS.primary} />
               </TouchableOpacity>
            </View>
         </View>

         {/* Manual Request Prompt */}
         <View style={styles.manualWrapper}>
            <LinearGradient 
               colors={[COLORS.onSurface, '#2d3748']} 
               style={styles.manualCard}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 0 }}
            >
               <View style={styles.manualInfo}>
                  <Text style={styles.manualTitle}>General Mission Request</Text>
                  <Text style={styles.manualSub}>Can't find your store? Our agents will fetch from any coordinates.</Text>
                  <TouchableOpacity 
                    style={styles.manualBtn}
                    onPress={() => navigation.navigate('PabiliOrder', { 
                      store: { 
                        id: 'general', 
                        name: 'Any Store in Butuan', 
                        category: 'Others', 
                        address: 'Multiple Locations', 
                        barangay: 'User Choice',
                        image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=800'
                      } 
                    })}
                  >
                     <Text style={styles.manualBtnText}>POST REQUEST</Text>
                     <Ionicons name="arrow-forward" size={14} color={COLORS.onSurface} />
                  </TouchableOpacity>
               </View>
               <View style={styles.manualVisual}>
                  <Ionicons name="create-outline" size={60} color="rgba(255,255,255,0.05)" style={styles.manualBgIcon} />
               </View>
            </LinearGradient>
         </View>

         {/* Hero Promo */}
         <TouchableOpacity style={styles.heroBanner} activeOpacity={0.9}>
            <Image 
               source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800' }} 
               style={styles.heroImg} 
               contentFit="cover"
               transition={500}
               placeholder="LHF~Hn00D$aJ%NM{RjWB.8D%t7t7"
            />
            <LinearGradient colors={['transparent', 'rgba(15,20,25,0.85)']} style={styles.heroOverlay} />
            <View style={styles.heroContent}>
               <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>ESTABLISHED</Text></View>
               <Text style={styles.heroTitle}>Premium Groceries</Text>
               <Text style={styles.heroSub}>Local hyper-markets fetched directly to you</Text>
            </View>
         </TouchableOpacity>

         {/* Categories */}
         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {STORE_CATEGORIES.map((cat, i) => (
               <TouchableOpacity 
                  key={i} 
                  style={[styles.catChip, activeCategory === cat.label && styles.activeCatChip]}
                  onPress={() => {
                     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                     setActiveCategory(cat.label);
                  }}
               >
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.catLabel, activeCategory === cat.label && styles.activeCatLabel]}>{cat.label}</Text>
               </TouchableOpacity>
            ))}
         </ScrollView>

         {/* Store Grid */}
         {/* Filter Header */}
         <View style={styles.gridHeader}>
            <Text style={styles.gridTitle}>
               {activeCategory === 'All' ? 'BROWSE BY CATEGORY' : `${activeCategory.toUpperCase()} VENDORS`}
            </Text>
            {activeCategory !== 'All' && (
              <TouchableOpacity onPress={() => {
                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                 setActiveCategory('All');
              }}>
                 <Text style={styles.clearBtn}>View All</Text>
              </TouchableOpacity>
            )}
         </View>

         {loading ? (
           <View style={{ marginTop: 10 }}>
             {[1, 2, 3].map((_, i) => (
               <View key={i} style={styles.storeCard}>
                 <Skeleton width="100%" height={140} borderRadius={0} />
                 <View style={styles.storeDetails}>
                   <View style={{ flex: 1, gap: 8 }}>
                     <Skeleton width="60%" height={16} />
                     <Skeleton width="40%" height={12} />
                   </View>
                   <Skeleton width={32} height={32} borderRadius={16} />
                 </View>
               </View>
             ))}
           </View>
         ) : (
           <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              {activeCategory === 'All' && !searchQuery ? (
                <View style={styles.catMatrix}>
                   {/* Primary Category Matrix */}
                   {STORE_CATEGORIES.filter(c => c.label !== 'All').map((cat, i) => (
                      <TouchableOpacity 
                         key={i} 
                         style={styles.matrixCard}
                         onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setActiveCategory(cat.label);
                         }}
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
                <View>
                   {/* Filtered Store List */}
                   {filteredStores.length === 0 ? (
                     <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                        <Ionicons name="alert-circle-outline" size={40} color="rgba(0,0,0,0.2)" />
                        <Text style={{ marginTop: 12, color: 'rgba(0,0,0,0.3)', fontWeight: '700' }}>NO VENDORS FOUND</Text>
                     </View>
                   ) : (
                     filteredStores.map((store) => (
                        <TouchableOpacity 
                           key={store.id} 
                           style={styles.storeCard}
                           onPress={() => navigation.navigate('PabiliOrder', { store })}
                           activeOpacity={0.9}
                        >
                           <View style={styles.cardVisual}>
                              <Image 
                                 source={{ uri: store.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500' }} 
                                 style={styles.storeImg} 
                                 contentFit="cover"
                                 transition={500}
                                 placeholder="LHF~Hn00D$aJ%NM{RjWB.8D%t7t7"
                              />
                              <View style={styles.cardHeader}>
                                 <View style={styles.ratingBox}>
                                    <Ionicons name="star" size={10} color={COLORS.tertiary} />
                                    <Text style={styles.ratingVal}>{store.rating}</Text>
                                 </View>
                                 {store.isVerified && (
                                    <View style={styles.verifiedBox}>
                                       <Ionicons name="shield-checkmark" size={12} color={COLORS.white} />
                                    </View>
                                 )}
                              </View>
                              <View style={styles.statusBox}>
                                 <View style={[styles.statusDot, { backgroundColor: store.isOpen ? COLORS.tertiary : COLORS.error }]} />
                                 <Text style={styles.statusText}>{store.isOpen ? 'ACTIVE' : 'OFFLINE'}</Text>
                              </View>
                           </View>
                           <View style={styles.storeDetails}>
                              <View style={{ flex: 1 }}>
                                 <Text style={styles.storeName}>{store.name}</Text>
                                 <Text style={styles.storeLoc}>{store.category} • {store.barangay}</Text>
                              </View>
                              <TouchableOpacity 
                                 style={styles.actionBtn}
                                 onPress={() => navigation.navigate('PabiliOrder', { store })}
                              >
                                 <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                              </TouchableOpacity>
                           </View>
                        </TouchableOpacity>
                     ))
                   )}
                </View>
              )}
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
  headerInfo: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.3)',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchBlock: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  scanBtn: {
    padding: 8,
  },
  heroBanner: {
    marginHorizontal: 20,
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    ...SHADOWS.md,
  },
  manualWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  manualCard: {
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  manualInfo: {
    flex: 2,
    zIndex: 2,
  },
  manualTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 4,
  },
  manualSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 16,
    fontWeight: '500',
    marginBottom: 20,
  },
  manualBtn: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  manualBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: 1,
  },
  manualVisual: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  manualBgIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
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
    marginTop: 2,
  },
  catScroll: {
    paddingLeft: 20,
    paddingBottom: 32,
    gap: 12,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 8,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeCatChip: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}05`,
  },
  catEmoji: {
    fontSize: 16,
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.4)',
  },
  activeCatLabel: {
    color: COLORS.primary,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  gridTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: 'rgba(0,0,0,0.25)',
  },
  clearBtn: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  catMatrix: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 12,
  },
  matrixCard: {
    width: (width - 54) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  matrixIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  matrixEmoji: {
    fontSize: 28,
  },
  matrixLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  storeCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginBottom: 20,
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  cardVisual: {
    height: 140,
    position: 'relative',
  },
  storeImg: {
    width: '100%',
    height: '100%',
  },
  cardHeader: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingVal: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  verifiedBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statusBox: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(15,20,25,0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
  storeDetails: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  storeLoc: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '600',
    marginTop: 2,
  },
  actionBtn: {
    marginLeft: 12,
  },
});
