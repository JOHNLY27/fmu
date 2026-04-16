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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { BUTUAN_STORES, STORE_CATEGORIES } from '../constants/butuanStores';

const { width } = Dimensions.get('window');

export default function StoreDirectoryScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const filteredStores = useMemo(() => {
    let stores = BUTUAN_STORES;
    if (activeCategory !== 'All') stores = stores.filter(s => s.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      stores = stores.filter(s => s.name.toLowerCase().includes(q) || s.barangay.toLowerCase().includes(q));
    }
    return stores;
  }, [searchQuery, activeCategory]);

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

         {/* Hero Promo */}
         <TouchableOpacity style={styles.heroBanner} activeOpacity={0.9}>
            <Image 
               source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800' }} 
               style={styles.heroImg} 
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
                  onPress={() => setActiveCategory(cat.label)}
               >
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.catLabel, activeCategory === cat.label && styles.activeCatLabel]}>{cat.label}</Text>
               </TouchableOpacity>
            ))}
         </ScrollView>

         {/* Store Grid */}
         <View style={styles.gridHeader}>
            <Text style={styles.gridTitle}>AVAILABLE VENDORS</Text>
            <Text style={styles.gridCount}>{filteredStores.length} OPERATIONAL</Text>
         </View>

         <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {filteredStores.map((store) => (
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
            ))}
         </Animated.View>

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
  gridCount: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.tertiary,
    letterSpacing: 1,
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
