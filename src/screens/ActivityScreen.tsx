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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { 
  subscribeToUserOrders, 
  cancelOrder, 
  Order 
} from '../services/orderService';

const { width } = Dimensions.get('window');

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';

const FILTER_TABS: { key: FilterTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all', label: 'All', icon: 'list' },
  { key: 'active', label: 'Active', icon: 'pulse' },
  { key: 'completed', label: 'Done', icon: 'checkmark-circle' },
  { key: 'cancelled', label: 'Cancelled', icon: 'close-circle' },
];

const ORDER_TYPE_CONFIG: Record<string, { 
  icon: keyof typeof Ionicons.glyphMap; 
  color: string; 
  label: string;
  emoji: string;
}> = {
  food: { icon: 'restaurant', color: COLORS.primary, label: 'Food Delivery', emoji: '🍽️' },
  ride: { icon: 'car', color: COLORS.secondary, label: 'Ride', emoji: '🚗' },
  parcel: { icon: 'cube', color: '#E67E22', label: 'Parcel', emoji: '📦' },
  pabili: { icon: 'bag-handle', color: COLORS.tertiary, label: 'Pabili', emoji: '🛍️' },
};

const STATUS_CONFIG: Record<string, {
  color: string;
  bgColor: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = {
  pending: { color: '#E67E22', bgColor: '#E67E2215', label: 'Finding Rider...', icon: 'time' },
  accepted: { color: COLORS.secondary, bgColor: `${COLORS.secondary}15`, label: 'Rider Accepted', icon: 'person-circle' },
  picked_up: { color: COLORS.primary, bgColor: `${COLORS.primary}15`, label: 'On the Way', icon: 'bicycle' },
  completed: { color: COLORS.tertiary, bgColor: `${COLORS.tertiary}15`, label: 'Completed', icon: 'checkmark-circle' },
  cancelled: { color: COLORS.error, bgColor: `${COLORS.error}15`, label: 'Cancelled', icon: 'close-circle' },
};

function getTimeAgo(timestamp: any): string {
  if (!timestamp) return 'Just now';
  
  const now = new Date();
  let orderDate: Date;
  
  if (timestamp?.toDate) {
    orderDate = timestamp.toDate();
  } else if (timestamp?.seconds) {
    orderDate = new Date(timestamp.seconds * 1000);
  } else {
    return 'Just now';
  }
  
  const diffMs = now.getTime() - orderDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return orderDate.toLocaleDateString('en-PH', { 
    month: 'short', 
    day: 'numeric',
    year: diffDays > 365 ? 'numeric' : undefined,
  });
}

function formatDate(timestamp: any): string {
  if (!timestamp) return '';
  let date: Date;
  if (timestamp?.toDate) date = timestamp.toDate();
  else if (timestamp?.seconds) date = new Date(timestamp.seconds * 1000);
  else return '';
  
  return date.toLocaleDateString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function ActivityScreen({ navigation }: any) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Animated values for the pulsing active order indicator
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Pulsing animation for active orders
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

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

    return () => unsubscribe();
  }, [user]);

  const filteredOrders = useMemo(() => {
    switch (activeFilter) {
      case 'active':
        return orders.filter(o => ['pending', 'accepted', 'picked_up'].includes(o.status));
      case 'completed':
        return orders.filter(o => o.status === 'completed');
      case 'cancelled':
        return orders.filter(o => o.status === 'cancelled');
      default:
        return orders;
    }
  }, [orders, activeFilter]);

  const stats = useMemo(() => {
    const active = orders.filter(o => ['pending', 'accepted', 'picked_up'].includes(o.status)).length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const totalSpent = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.price || 0), 0);
    return { active, completed, cancelled, totalSpent, total: orders.length };
  }, [orders]);

  const isActiveOrder = (status: string) => 
    ['pending', 'accepted', 'picked_up'].includes(status);

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This cannot be undone.',
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await cancelOrder(orderId);
              if (success) {
                Alert.alert('Cancelled', 'Your order has been cancelled.');
              } else {
                Alert.alert('Cannot Cancel', 'This order can no longer be cancelled (rider may have already accepted).');
              }
            } catch (e) {
              Alert.alert('Error', 'Failed to cancel order.');
            }
          },
        },
      ]
    );
  };

  const handleReorder = (order: Order) => {
    if (order.type === 'pabili') {
      navigation.navigate('StoreDirectory');
    } else if (order.type === 'food') {
      navigation.navigate('FoodDelivery');
    } else if (order.type === 'ride') {
      navigation.navigate('RideSelection');
    } else {
      navigation.navigate('ParcelDelivery');
    }
  };

  const handleTrackOrder = (orderId: string) => {
    navigation.navigate('TrackingDetail', { orderId });
  };

  const renderActiveOrders = () => {
    const activeOrders = orders.filter(o => isActiveOrder(o.status));
    if (activeOrders.length === 0) return null;

    return (
      <View style={styles.activeSection}>
        <View style={styles.activeSectionHeader}>
          <View style={styles.activeDotContainer}>
            <Animated.View style={[styles.activePulse, { transform: [{ scale: pulseAnim }] }]} />
            <View style={styles.activeDot} />
          </View>
          <Text style={styles.activeSectionTitle}>Live Orders</Text>
          <View style={styles.activeCountBadge}>
            <Text style={styles.activeCountText}>{activeOrders.length}</Text>
          </View>
        </View>

        {activeOrders.map((order) => {
          const typeConfig = ORDER_TYPE_CONFIG[order.type] || ORDER_TYPE_CONFIG.food;
          const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

          return (
            <TouchableOpacity
              key={order.id}
              style={styles.activeCard}
              activeOpacity={0.9}
              onPress={() => handleTrackOrder(order.id!)}
            >
              <LinearGradient
                colors={[COLORS.surfaceLowest, `${typeConfig.color}08`]}
                style={styles.activeCardGradient}
              >
                {/* Top Row */}
                <View style={styles.activeCardHeader}>
                  <View style={[styles.activeTypeIcon, { backgroundColor: `${typeConfig.color}15` }]}>
                    <Text style={{ fontSize: 20 }}>{typeConfig.emoji}</Text>
                  </View>
                  <View style={styles.activeCardInfo}>
                    <Text style={styles.activeCardType}>{typeConfig.label}</Text>
                    <Text style={styles.activeCardTime}>{getTimeAgo(order.createdAt)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                    <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
                    <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.activeCardDetails}>
                  <View style={styles.locationRow}>
                    <View style={styles.locationDots}>
                      <View style={[styles.locationDot, { backgroundColor: typeConfig.color }]} />
                      <View style={styles.locationLine} />
                      <View style={[styles.locationDot, { backgroundColor: COLORS.tertiary }]} />
                    </View>
                    <View style={styles.locationTexts}>
                      <Text style={styles.locationLabel} numberOfLines={1}>
                        {order.pickupLocation || 'Pickup'}
                      </Text>
                      <Text style={styles.locationLabel} numberOfLines={1}>
                        {order.dropoffLocation || 'Dropoff'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Items Preview (for food/pabili) */}
                {order.itemDetails && (
                  <View style={styles.itemsPreview}>
                    <Ionicons name="receipt-outline" size={13} color={COLORS.onSurfaceVariant} />
                    <Text style={styles.itemsPreviewText} numberOfLines={1}>
                      {order.itemDetails}
                    </Text>
                  </View>
                )}

                {/* Bottom Row */}
                <View style={styles.activeCardFooter}>
                  <Text style={styles.activeCardPrice}>₱{order.price?.toFixed(2) || '0.00'}</Text>
                  <View style={styles.activeCardActions}>
                    {order.status === 'pending' && (
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => handleCancelOrder(order.id!)}
                      >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.trackBtn}
                      onPress={() => handleTrackOrder(order.id!)}
                    >
                      <Ionicons name="navigate" size={14} color={COLORS.white} />
                      <Text style={styles.trackBtnText}>Track</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderOrderCard = (order: Order) => {
    const typeConfig = ORDER_TYPE_CONFIG[order.type] || ORDER_TYPE_CONFIG.food;
    const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const isActive = isActiveOrder(order.status);

    return (
      <TouchableOpacity
        key={order.id}
        style={[styles.orderCard, isActive && styles.orderCardActive]}
        activeOpacity={0.88}
        onPress={() => isActive ? handleTrackOrder(order.id!) : undefined}
      >
        <View style={styles.orderCardTop}>
          {/* Type */}
          <View style={[styles.orderTypeIcon, { backgroundColor: `${typeConfig.color}12` }]}>
            <Ionicons name={typeConfig.icon} size={20} color={typeConfig.color} />
          </View>

          {/* Info */}
          <View style={styles.orderCardMiddle}>
            <Text style={styles.orderCardTitle} numberOfLines={1}>
              {order.type === 'pabili' ? '🛍️ Pabili Order' : 
               order.type === 'food' ? '🍽️ Food Delivery' :
               order.type === 'ride' ? '🚗 Ride' : '📦 Parcel'}
            </Text>
            <Text style={styles.orderCardSubtitle} numberOfLines={1}>
              {order.pickupLocation || 'N/A'}
            </Text>
            {order.itemDetails && (
              <Text style={styles.orderCardItems} numberOfLines={1}>
                {order.itemDetails}
              </Text>
            )}
          </View>

          {/* Price & Status */}
          <View style={styles.orderCardRight}>
            <Text style={styles.orderCardPrice}>₱{order.price?.toFixed(2) || '0.00'}</Text>
            <View style={[styles.miniStatusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <View style={[styles.miniStatusDot, { backgroundColor: statusConfig.color }]} />
              <Text style={[styles.miniStatusText, { color: statusConfig.color }]}>
                {order.status === 'picked_up' ? 'On Way' : 
                 order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom meta row */}
        <View style={styles.orderCardBottom}>
          <View style={styles.orderMeta}>
            <Ionicons name="time-outline" size={12} color={COLORS.onSurfaceVariant} />
            <Text style={styles.orderMetaText}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={styles.orderMeta}>
            <Ionicons name="location-outline" size={12} color={COLORS.onSurfaceVariant} />
            <Text style={styles.orderMetaText} numberOfLines={1}>{order.dropoffLocation || 'N/A'}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.orderCardActions}>
          {isActive && order.status === 'pending' && (
            <TouchableOpacity
              style={styles.orderActionBtn}
              onPress={() => handleCancelOrder(order.id!)}
            >
              <Ionicons name="close" size={14} color={COLORS.error} />
              <Text style={[styles.orderActionText, { color: COLORS.error }]}>Cancel</Text>
            </TouchableOpacity>
          )}
          {isActive && (
            <TouchableOpacity
              style={[styles.orderActionBtn, styles.orderActionBtnFilled]}
              onPress={() => handleTrackOrder(order.id!)}
            >
              <Ionicons name="navigate" size={14} color={COLORS.white} />
              <Text style={[styles.orderActionText, { color: COLORS.white }]}>Track Order</Text>
            </TouchableOpacity>
          )}
          {order.status === 'completed' && (
            <TouchableOpacity
              style={styles.orderActionBtn}
              onPress={() => handleReorder(order)}
            >
              <Ionicons name="refresh" size={14} color={COLORS.primary} />
              <Text style={[styles.orderActionText, { color: COLORS.primary }]}>Reorder</Text>
            </TouchableOpacity>
          )}
          {order.status === 'completed' && (
            <TouchableOpacity style={styles.orderActionBtn}>
              <Ionicons name="receipt-outline" size={14} color={COLORS.onSurfaceVariant} />
              <Text style={styles.orderActionText}>Receipt</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.emptyCenter]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
        <Ionicons name="log-in-outline" size={56} color={`${COLORS.onSurfaceVariant}40`} />
        <Text style={styles.emptyTitle}>Sign in to see your activity</Text>
        <Text style={styles.emptyDesc}>Your order history and active orders will appear here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>YOUR ORDERS</Text>
          <Text style={styles.headerTitle}>Activity</Text>
        </View>
        {stats.total > 0 && (
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{stats.total}</Text>
              <Text style={styles.headerStatLabel}>Total</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStat}>
              <Text style={[styles.headerStatValue, { color: COLORS.tertiary }]}>
                ₱{stats.totalSpent.toFixed(0)}
              </Text>
              <Text style={styles.headerStatLabel}>Spent</Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => setRefreshing(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Active Orders Section (always visible at top) */}
        {activeFilter !== 'cancelled' && activeFilter !== 'completed' && renderActiveOrders()}

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {FILTER_TABS.map((tab) => {
            const count = tab.key === 'all' ? stats.total 
              : tab.key === 'active' ? stats.active 
              : tab.key === 'completed' ? stats.completed 
              : stats.cancelled;
            
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterTab, activeFilter === tab.key && styles.filterTabActive]}
                onPress={() => setActiveFilter(tab.key)}
              >
                <Ionicons 
                  name={tab.icon} 
                  size={14} 
                  color={activeFilter === tab.key ? COLORS.primary : COLORS.onSurfaceVariant} 
                />
                <Text style={[
                  styles.filterTabText,
                  activeFilter === tab.key && styles.filterTabTextActive,
                ]}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={[
                    styles.filterCount,
                    activeFilter === tab.key && styles.filterCountActive,
                  ]}>
                    <Text style={[
                      styles.filterCountText,
                      activeFilter === tab.key && styles.filterCountTextActive,
                    ]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Order History Section Label */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>
            📋 {activeFilter === 'all' ? 'ALL ORDERS' 
               : activeFilter === 'active' ? 'ACTIVE ORDERS'
               : activeFilter === 'completed' ? 'COMPLETED ORDERS'
               : 'CANCELLED ORDERS'}
          </Text>
          <Text style={styles.sectionCount}>
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.emptyCenter}>
            <Text style={styles.emptyDesc}>Loading your orders...</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons 
                name={activeFilter === 'cancelled' ? 'close-circle-outline' : 'receipt-outline'} 
                size={48} 
                color={`${COLORS.onSurfaceVariant}30`} 
              />
            </View>
            <Text style={styles.emptyTitle}>
              {activeFilter === 'active' ? 'No active orders'
               : activeFilter === 'completed' ? 'No completed orders yet'
               : activeFilter === 'cancelled' ? 'No cancelled orders'
               : 'No orders yet'}
            </Text>
            <Text style={styles.emptyDesc}>
              {activeFilter === 'all' || activeFilter === 'active'
                ? 'Place your first order from the home screen!'
                : 'Orders will appear here once you have some.'}
            </Text>
            {(activeFilter === 'all' || activeFilter === 'active') && (
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('Home')}
              >
                <Ionicons name="add" size={18} color={COLORS.white} />
                <Text style={styles.emptyBtnText}>Place an Order</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Order List */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {filteredOrders
            .filter(o => activeFilter !== 'all' || !isActiveOrder(o.status) || activeFilter === 'active')
            .map(renderOrderCard)}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 54,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    color: COLORS.primary,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },
  headerStatLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: `${COLORS.outlineVariant}30`,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  // Active Orders Section
  activeSection: {
    marginBottom: SPACING.xl,
  },
  activeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  activeDotContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePulse: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: `${COLORS.tertiary}25`,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.tertiary,
  },
  activeSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
    flex: 1,
  },
  activeCountBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  activeCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
  },
  // Active Card
  activeCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}15`,
  },
  activeCardGradient: {
    padding: SPACING.lg,
  },
  activeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  activeTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCardInfo: {
    flex: 1,
  },
  activeCardType: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  activeCardTime: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Location dots
  activeCardDetails: {
    marginBottom: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  locationDots: {
    alignItems: 'center',
    width: 12,
    paddingVertical: 2,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  locationLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: `${COLORS.outlineVariant}40`,
    minHeight: 16,
    marginVertical: 2,
  },
  locationTexts: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 8,
  },
  locationLabel: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  itemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${COLORS.surfaceHigh}80`,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: SPACING.md,
  },
  itemsPreviewText: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
    flex: 1,
  },
  activeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeCardPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  activeCardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.error}10`,
    borderWidth: 1,
    borderColor: `${COLORS.error}25`,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.error,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  trackBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Filter Tabs
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  filterTabActive: {
    backgroundColor: `${COLORS.primary}10`,
    borderColor: `${COLORS.primary}40`,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  filterTabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  filterCount: {
    backgroundColor: `${COLORS.onSurfaceVariant}15`,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: RADIUS.full,
    minWidth: 18,
    alignItems: 'center',
  },
  filterCountActive: {
    backgroundColor: `${COLORS.primary}20`,
  },
  filterCountText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  filterCountTextActive: {
    color: COLORS.primary,
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.primary,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  // Order Card
  orderCard: {
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}15`,
  },
  orderCardActive: {
    borderColor: `${COLORS.primary}30`,
    borderWidth: 1.5,
  },
  orderCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  orderTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderCardMiddle: {
    flex: 1,
  },
  orderCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  orderCardSubtitle: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
    marginTop: 1,
  },
  orderCardItems: {
    fontSize: 10,
    color: `${COLORS.onSurfaceVariant}80`,
    fontWeight: '500',
    marginTop: 2,
    fontStyle: 'italic',
  },
  orderCardRight: {
    alignItems: 'flex-end',
  },
  orderCardPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
  },
  miniStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginTop: 4,
  },
  miniStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  miniStatusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  orderCardBottom: {
    flexDirection: 'row',
    gap: SPACING.lg,
    paddingTop: SPACING.sm,
    marginBottom: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.outlineVariant}12`,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  orderMetaText: {
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
    flex: 1,
  },
  orderCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  orderActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.surfaceHigh}`,
  },
  orderActionBtnFilled: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  orderActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  // Empty State
  emptyCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.md,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
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
    maxWidth: '80%',
    lineHeight: 19,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
