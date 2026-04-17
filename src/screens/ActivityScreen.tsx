import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserOrders, cancelOrder, Order } from '../services/orderService';
import Button from '../components/ui/Button';

const { width } = Dimensions.get('window');

type FilterTab = 'all' | 'active' | 'history';

export default function ActivityScreen({ navigation }: any) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserOrders(user.uid, (liveOrders) => {
      setOrders(liveOrders);
      setLoading(false);
      setRefreshing(false);
    });

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
    ]).start();

    return () => unsubscribe();
  }, [user]);

  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return orders.filter(o => ['pending', 'accepted', 'picked_up'].includes(o.status));
      case 'history':
        return orders.filter(o => ['completed', 'cancelled'].includes(o.status));
      default:
        return orders;
    }
  }, [orders, activeTab]);

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'Abort Mission?',
      'Changes to scheduled fetches may incur tiny platform fees. Procced?',
      [
        { text: 'Keep Session', style: 'cancel' },
        {
          text: 'Abort Fetch',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await cancelOrder(orderId);
              if (success) Alert.alert('Cancelled', 'Order session terminated.');
              else Alert.alert('Denied', 'Rider is already at your coordinates.');
            } catch (e) {
              Alert.alert('Error', 'Communication failure.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return COLORS.secondary;
      case 'accepted': return COLORS.primary;
      case 'picked_up': return COLORS.tertiary;
      case 'completed': return '#4CAF50';
      case 'cancelled': return COLORS.error;
      default: return COLORS.onSurfaceVariant;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>SESSION LOGS</Text>
          <Text style={styles.headerTitle}>Activity</Text>
        </View>
        <TouchableOpacity style={styles.historyBtn}>
           <Ionicons name="filter-outline" size={22} color={COLORS.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Modern Filter Strip */}
      <View style={styles.filterStrip}>
        {(['all', 'active', 'history'] as FilterTab[]).map((tab) => (
           <TouchableOpacity 
            key={tab} 
            style={[styles.filterTab, activeTab === tab && styles.activeFilterTab]}
            onPress={() => setActiveTab(tab)}
           >
              <Text style={[styles.filterTabText, activeTab === tab && styles.activeFilterTabText]}>
                {tab === 'all' ? 'All Logs' : tab === 'active' ? 'Ongoing' : 'Settled'}
              </Text>
              {activeTab === tab && <View style={styles.activeIndicator} />}
           </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={COLORS.primary} />}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
               <View style={styles.emptyCircle}>
                  <Ionicons name="receipt-outline" size={42} color="rgba(0,0,0,0.1)" />
               </View>
               <Text style={styles.emptyTitle}>No Sessions Found</Text>
               <Text style={styles.emptySub}>Your mission history will materialize here once you start fetching.</Text>
               <Button 
                title="Scount Services" 
                onPress={() => navigation.navigate('Home')} 
                variant="primary" 
                size="md"
                style={{ marginTop: 20 }}
               />
            </View>
          ) : (
            filteredOrders.map((order, idx) => {
               const isActive = ['pending', 'accepted', 'picked_up'].includes(order.status);
               const statusColor = getStatusColor(order.status);
               const orderDate = new Date(typeof order.createdAt === 'string' ? order.createdAt : (order.createdAt.seconds * 1000));
               
               return (
                  <TouchableOpacity 
                    key={order.id || idx} 
                    style={[styles.orderCard, isActive && styles.activeOrderCard]}
                    onPress={() => navigation.navigate('TrackingDetail', { orderId: order.id })}
                  >
                     <View style={styles.cardHeader}>
                        <View style={[styles.typeBadge, { backgroundColor: `${statusColor}10` }]}>
                           <Ionicons 
                            name={order.serviceType === 'food' ? 'restaurant' : order.serviceType === 'ride' ? 'car' : 'cube'} 
                            size={16} color={statusColor} 
                           />
                           <Text style={[styles.typeText, { color: statusColor }]}>{(order.serviceType || 'Fetch').toUpperCase()}</Text>
                        </View>
                        <Text style={styles.orderId}>#{order.id?.substring(0, 8).toUpperCase()}</Text>
                     </View>

                     <View style={styles.cardBody}>
                        <View style={styles.routeGroup}>
                           <View style={styles.locRow}>
                              <View style={[styles.dot, { backgroundColor: statusColor }]} />
                              <Text style={styles.locText} numberOfLines={1}>{order.pickupLocation}</Text>
                           </View>
                           <View style={styles.locRow}>
                              <Ionicons name="location" size={14} color={COLORS.tertiary} />
                              <Text style={styles.locText} numberOfLines={1}>{order.dropoffLocation}</Text>
                           </View>
                           {order.itemDetails && (
                             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                                <Ionicons name="list" size={12} color="rgba(0,0,0,0.3)" />
                                <Text style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', fontStyle: 'italic' }} numberOfLines={1}>
                                   {order.itemDetails}
                                </Text>
                             </View>
                           )}
                        </View>
                        
                        <View style={styles.pricingSide}>
                           <Text style={styles.priceValue}>₱{order.price?.toFixed(2)}</Text>
                           <View style={styles.paymentBadge}>
                              <Ionicons 
                                name={
                                  order.paymentMethod === 'cash' ? 'cash-outline' : 
                                  order.paymentMethod === 'gcash' ? 'wallet-outline' : 
                                  order.paymentMethod === 'maya' ? 'card-outline' : 'card'
                                } 
                                size={10} 
                                color={COLORS.primary} 
                              />
                              <Text style={styles.paymentMethodText}>{(order.paymentMethod || 'cash').toUpperCase()}</Text>
                           </View>
                           <Text style={styles.dateText}>{orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                        </View>
                     </View>

                     <View style={styles.cardFooter}>
                        <View style={styles.statusBox}>
                           <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                           <Text style={[styles.statusLabel, { color: statusColor }]}>{order.status.replace('_', ' ').toUpperCase()}</Text>
                        </View>

                        <View style={styles.actions}>
                           {isActive && order.status === 'pending' && (
                              <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancelOrder(order.id!)}>
                                 <Text style={styles.cancelText}>CANCEL</Text>
                              </TouchableOpacity>
                           )}
                           <TouchableOpacity 
                            style={[styles.trackBtn, { backgroundColor: isActive ? COLORS.onSurface : '#F1F3F5' }]}
                            onPress={() => navigation.navigate('TrackingDetail', { orderId: order.id })}
                           >
                              <Text style={[styles.trackText, { color: isActive ? COLORS.white : 'rgba(0,0,0,0.4)' }]}>
                                {isActive ? 'TRACK' : 'RECEIPT'}
                              </Text>
                           </TouchableOpacity>
                        </View>
                     </View>
                  </TouchableOpacity>
               );
            })
          )}

        </Animated.View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: 'rgba(0,0,0,0.35)',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -1,
  },
  historyBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  filterStrip: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    backgroundColor: COLORS.white,
    gap: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  filterTab: {
    paddingVertical: 14,
    position: 'relative',
  },
  activeFilterTab: {},
  filterTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.3)',
  },
  activeFilterTabText: {
    color: COLORS.primary,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  activeOrderCard: {
    borderColor: 'rgba(73,83,172,0.15)',
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  orderId: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.2)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  routeGroup: {
    flex: 1,
    gap: 10,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  locText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    flex: 1,
  },
  pricingSide: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  dateText: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.3)',
    fontWeight: '700',
    marginTop: 4,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  paymentMethodText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#F1F3F5',
  },
  cancelText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.error,
    letterSpacing: 0.5,
  },
  trackBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    ...SHADOWS.sm,
  },
  trackText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  emptySub: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 20,
    fontWeight: '500',
  },
});
