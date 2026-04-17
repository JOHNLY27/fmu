import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants/theme';
import { Restaurant, MenuItem } from '../types';
import Button from '../components/ui/Button';

const { width, height } = Dimensions.get('window');

export default function RestaurantMenuScreen({ navigation, route }: any) {
  const restaurant: Restaurant = route.params?.restaurant;
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<{item: MenuItem, qty: number}[]>([]);
  
  const menuCategories = ['All', ...new Set(restaurant.menu.map(m => m.category))];
  
  const filteredMenu = activeCategory === 'All' 
    ? restaurant.menu 
    : restaurant.menu.filter(m => m.category === activeCategory);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === itemId);
      if (existing && existing.qty > 1) {
        return prev.map(c => c.item.id === itemId ? { ...c, qty: c.qty - 1 } : c);
      }
      return prev.filter(c => c.item.id !== itemId);
    });
  };

  const cartTotal = cart.reduce((sum, c) => sum + (c.item.price * c.qty), 0);
  const cartItemCount = cart.reduce((sum, c) => sum + c.qty, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" transparent backgroundColor="transparent" />
      
      {/* Header Visual */}
      <View style={styles.hero}>
        <Image source={{ uri: restaurant.image }} style={styles.heroImg} />
        <LinearGradient colors={['rgba(0,0,0,0.6)', '#0f1419']} style={styles.heroOverlay} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <View style={styles.heroContent}>
           <Text style={styles.restName}>{restaurant.name}</Text>
           <View style={styles.metaRow}>
              <View style={styles.badge}>
                 <Ionicons name="star" size={12} color={COLORS.tertiary} />
                 <Text style={styles.badgeText}>{restaurant.rating}</Text>
              </View>
              <View style={styles.badge}>
                 <Ionicons name="time" size={12} color={COLORS.white} />
                 <Text style={styles.badgeText}>{restaurant.deliveryTime}</Text>
              </View>
              <Text style={styles.catText}>• {restaurant.category}</Text>
           </View>
        </View>
      </View>

      {/* Category Navigation */}
      <View style={styles.catNav}>
         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {menuCategories.map((cat, i) => (
               <TouchableOpacity 
                 key={i} 
                 style={[styles.catChip, activeCategory === cat && styles.activeChip]}
                 onPress={() => setActiveCategory(cat)}
               >
                  <Text style={[styles.catChipText, activeCategory === cat && styles.activeChipText]}>{cat}</Text>
               </TouchableOpacity>
            ))}
         </ScrollView>
      </View>

      {/* Menu List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuScroll}>
         {filteredMenu.map((item) => {
           const cartItem = cart.find(c => c.item.id === item.id);
           return (
             <View key={item.id} style={styles.menuItem}>
                <View style={styles.itemInfo}>
                   <Text style={styles.itemName}>{item.name}</Text>
                   <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                   <Text style={styles.itemPrice}>₱{item.price.toFixed(2)}</Text>
                </View>
                
                <View style={styles.itemAction}>
                   {cartItem ? (
                     <View style={styles.qtyControl}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.id)}>
                           <Ionicons name="remove" size={18} color={COLORS.onSurface} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{cartItem.qty}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(item)}>
                           <Ionicons name="add" size={18} color={COLORS.onSurface} />
                        </TouchableOpacity>
                     </View>
                   ) : (
                     <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                        <Ionicons name="add" size={24} color={COLORS.white} />
                     </TouchableOpacity>
                   )}
                </View>
             </View>
           );
         })}
         <View style={{ height: 120 }} />
      </ScrollView>

      {/* Persistent Cart Dock */}
      {cart.length > 0 && (
         <Animated.View style={styles.cartDock}>
            <LinearGradient 
              colors={[COLORS.primary, '#E65100']} 
              start={{x:0, y:0}} 
              end={{x:1, y:0}} 
              style={styles.cartGradient}
            >
               <View style={styles.cartSummary}>
                  <View style={styles.cartIconBox}>
                     <Ionicons name="cart" size={20} color={COLORS.white} />
                     <View style={styles.cartCount}><Text style={styles.countText}>{cartItemCount}</Text></View>
                  </View>
                  <View style={{ marginLeft: 16 }}>
                     <Text style={styles.cartTotalText}>₱{cartTotal.toFixed(2)}</Text>
                     <Text style={styles.cartSub}>Subtotal (Excl. delivery)</Text>
                  </View>
               </View>
               <TouchableOpacity 
                 style={styles.checkoutBtn}
                 onPress={() => navigation.navigate('FoodCheckout', { 
                   restaurant, 
                   cart, 
                   total: cartTotal 
                 })}
               >
                  <Text style={styles.checkoutBtnText}>CHECKOUT</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.onPrimary} />
               </TouchableOpacity>
            </LinearGradient>
         </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  hero: {
    height: 280,
    width: '100%',
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  heroImg: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroContent: {
    paddingHorizontal: 24,
  },
  restName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  catNav: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    ...SHADOWS.sm,
  },
  catScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  catChip: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChip: {
    backgroundColor: COLORS.onSurface,
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.4)',
  },
  activeChipText: {
    color: COLORS.white,
  },
  menuScroll: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.sm,
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    paddingRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  itemDesc: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 4,
    fontWeight: '500',
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 8,
  },
  itemAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    borderRadius: 12,
    padding: 4,
    gap: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.xs,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  cartDock: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  cartGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  cartSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCount: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
  },
  cartTotalText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
  },
  cartSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  checkoutBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
});
