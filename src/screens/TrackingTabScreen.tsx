import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserOrders, cancelOrder, Order } from '../services/orderService';
import Button from '../components/ui/Button';

const { width } = Dimensions.get('window');

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

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', desc: 'Looking for a rider near you' },
  { key: 'accepted', label: 'Rider Accepted', desc: 'Rider is heading to pick up' },
  { key: 'picked_up', label: 'On the Way', desc: 'Your order is en route to you' },
  { key: 'completed', label: 'Delivered', desc: 'Order has been delivered!' },
];

function getStepIndex(status: string): number {
  const map: Record<string, number> = { pending: 0, accepted: 1, picked_up: 2, completed: 3 };
  return map[status] ?? 0;
}

function getETA(status: string): string {
  switch (status) {
    case 'pending': return 'Searching...';
    case 'accepted': return '~15-20 min';
    case 'picked_up': return '~5-10 min';
    case 'completed': return 'Delivered ✓';
    default: return '--';
  }
}

function getTimeAgo(timestamp: any): string {
  if (!timestamp) return 'Just now';
  let orderDate: Date;
  if (timestamp?.toDate) orderDate = timestamp.toDate();
  else if (timestamp?.seconds) orderDate = new Date(timestamp.seconds * 1000);
  else return 'Just now';
  const diffMs = Date.now() - orderDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffMs / 86400000)}d ago`;
}

export default function TrackingTabScreen({ navigation }: any) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    const unsubscribe = subscribeToUserOrders(user.uid, (liveOrders) => {
      setOrders(liveOrders);
      setLoading(false);
      setRefreshing(false);
    });
    return () => unsubscribe();
  }, [user]);

  const activeOrders = orders.filter(o => ['pending', 'accepted', 'picked_up'].includes(o.status));
  const recentCompleted = orders.filter(o => o.status === 'completed').slice(0, 3);

  const handleCancel = (orderId: string) => {
    const { Alert } = require('react-native');
    Alert.alert('Cancel Order?', 'This will cancel your pending order.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          const ok = await cancelOrder(orderId);
          if (!ok) Alert.alert('Cannot Cancel', 'Order already accepted by a rider.');
        },
      },
    ]);
  };

  // --- NOT LOGGED IN ---
  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
        <Ionicons name="navigate-outline" size={56} color={`${COLORS.onSurfaceVariant}30`} />
        <Text style={styles.emptyTitle}>Sign in to track orders</Text>
        <Text style={styles.emptyDesc}>Your live orders will appear here in real-time.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>LIVE TRACKING</Text>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <View style={styles.headerRight}>
          {activeOrders.length > 0 && (
            <View style={styles.activeBadge}>
              <Animated.View style={[styles.activePulseRing, { transform: [{ scale: pulseAnim }] }]} />
              <View style={styles.activePulseDot} />
              <Text style={styles.activeBadgeText}>{activeOrders.length} active</Text>
            </View>
          )}
        </View>
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
        {/* === ACTIVE ORDERS === */}
        {activeOrders.length > 0 ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            {activeOrders.map((order) => {
              const typeConfig = ORDER_TYPE_CONFIG[order.type] || ORDER_TYPE_CONFIG.food;
              const stepIdx = getStepIndex(order.status);

              return (
                <View key={order.id} style={styles.trackCard}>
                  {/* Card Header */}
                  <LinearGradient
                    colors={[typeConfig.color, `${typeConfig.color}CC`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.trackCardHeader}
                  >
                    <View style={styles.trackCardHeaderLeft}>
                      <Text style={{ fontSize: 22 }}>{typeConfig.emoji}</Text>
                      <View>
                        <Text style={styles.trackCardType}>{typeConfig.label}</Text>
                        <Text style={styles.trackCardTime}>{getTimeAgo(order.createdAt)}</Text>
                      </View>
                    </View>
                    <View style={styles.trackCardEta}>
                      <Text style={styles.trackCardEtaLabel}>ETA</Text>
                      <Text style={styles.trackCardEtaValue}>{getETA(order.status)}</Text>
                    </View>
                  </LinearGradient>

                  {/* Route */}
                  <View style={styles.trackRoute}>
                    <View style={styles.routeVisual}>
                      <View style={[styles.routeDot, { backgroundColor: typeConfig.color }]} />
                      <View style={[styles.routeDash, { borderColor: `${typeConfig.color}40` }]} />
                      <View style={[styles.routeDot, { backgroundColor: COLORS.tertiary }]} />
                    </View>
                    <View style={styles.routeInfo}>
                      <View style={styles.routePoint}>
                        <Text style={styles.routePointLabel}>PICKUP</Text>
                        <Text style={styles.routePointValue} numberOfLines={1}>
                          {order.pickupLocation || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.routePoint}>
                        <Text style={styles.routePointLabel}>DELIVER TO</Text>
                        <Text style={styles.routePointValue} numberOfLines={1}>
                          {order.dropoffLocation || 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Items (for food/pabili) */}
                  {order.itemDetails && (
                    <View style={styles.trackItems}>
                      <Ionicons name="receipt-outline" size={13} color={COLORS.onSurfaceVariant} />
                      <Text style={styles.trackItemsText} numberOfLines={2}>{order.itemDetails}</Text>
                    </View>
                  )}

                  {/* Progress Steps */}
                  <View style={styles.progressSection}>
                    <Text style={styles.progressLabel}>ORDER PROGRESS</Text>
                    <View style={styles.progressSteps}>
                      {STATUS_STEPS.map((step, i) => {
                        const isDone = i <= stepIdx;
                        const isCurrent = i === stepIdx;
                        return (
                          <View key={step.key} style={styles.progressStep}>
                            <View style={styles.progressStepLeft}>
                              <View style={[
                                styles.progressDot,
                                isDone && { backgroundColor: typeConfig.color },
                                isCurrent && styles.progressDotCurrent,
                              ]}>
                                {isDone && i < stepIdx && (
                                  <Ionicons name="checkmark" size={10} color={COLORS.white} />
                                )}
                                {isCurrent && (
                                  <Animated.View style={[
                                    styles.currentPulse,
                                    { backgroundColor: `${typeConfig.color}30`, transform: [{ scale: pulseAnim }] }
                                  ]} />
                                )}
                              </View>
                              {i < STATUS_STEPS.length - 1 && (
                                <View style={[
                                  styles.progressLine,
                                  isDone && i < stepIdx && { backgroundColor: typeConfig.color },
                                ]} />
                              )}
                            </View>
                            <View style={[styles.progressStepContent, !isDone && { opacity: 0.35 }]}>
                              <Text style={[
                                styles.progressStepTitle,
                                isCurrent && { color: typeConfig.color, fontWeight: '800' },
                              ]}>
                                {step.label}
                              </Text>
                              <Text style={styles.progressStepDesc}>{step.desc}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  {/* Price & Actions */}
                  <View style={styles.trackFooter}>
                    <View>
                      <Text style={styles.trackPriceLabel}>TOTAL</Text>
                      <Text style={styles.trackPrice}>₱{order.price?.toFixed(2) || '0.00'}</Text>
                    </View>
                    <View style={styles.trackActions}>
                      {order.status === 'pending' && (
                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => handleCancel(order.id!)}
                        >
                          <Ionicons name="close" size={16} color={COLORS.error} />
                          <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.chatBtn}
                        onPress={() => navigation.navigate('Chat', { orderId: order.id })}
                      >
                        <Ionicons name="chatbubble" size={14} color={COLORS.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.detailBtn}
                        onPress={() => navigation.navigate('TrackingDetail', { orderId: order.id })}
                      >
                        <Ionicons name="expand" size={14} color={COLORS.white} />
                        <Text style={styles.detailBtnText}>Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Order ID */}
                  <View style={styles.orderIdRow}>
                    <Text style={styles.orderIdLabel}>
                      Order #{order.id?.substring(0, 8).toUpperCase()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Animated.View>
        ) : (
          /* === EMPTY STATE === */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="navigate-outline" size={44} color={`${COLORS.primary}40`} />
            </View>
            <Text style={styles.emptyTitle}>No Active Orders</Text>
            <Text style={styles.emptyDesc}>
              When you place an order, you'll be able to track it live right here!
            </Text>
            <TouchableOpacity
              style={styles.emptyOrderBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyOrderBtnGradient}
              >
                <Ionicons name="add" size={18} color={COLORS.white} />
                <Text style={styles.emptyOrderBtnText}>Place an Order</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* === RECENTLY COMPLETED === */}
        {recentCompleted.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recently Completed</Text>
            {recentCompleted.map((order) => {
              const typeConfig = ORDER_TYPE_CONFIG[order.type] || ORDER_TYPE_CONFIG.food;
              return (
                <View key={order.id} style={styles.recentCard}>
                  <View style={[styles.recentIcon, { backgroundColor: `${typeConfig.color}12` }]}>
                    <Ionicons name={typeConfig.icon} size={18} color={typeConfig.color} />
                  </View>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentName} numberOfLines={1}>
                      {order.pickupLocation || typeConfig.label}
                    </Text>
                    <Text style={styles.recentMeta}>{getTimeAgo(order.createdAt)}</Text>
                  </View>
                  <View style={styles.recentRight}>
                    <Text style={styles.recentPrice}>₱{order.price?.toFixed(2)}</Text>
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark" size={10} color={COLORS.tertiary} />
                      <Text style={styles.completedText}>Done</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

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
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING.xl,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 54,
    paddingBottom: SPACING.md,
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
  headerRight: {},
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${COLORS.tertiary}12`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  activePulseRing: {
    position: 'absolute',
    left: 10,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: `${COLORS.tertiary}20`,
  },
  activePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.tertiary,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.tertiary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  // Track Card
  trackCard: {
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}10`,
  },
  trackCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  trackCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  trackCardType: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
  trackCardTime: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  trackCardEta: {
    alignItems: 'flex-end',
  },
  trackCardEtaLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.6)',
  },
  trackCardEtaValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
  },
  // Route
  trackRoute: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.outlineVariant}10`,
  },
  routeVisual: {
    alignItems: 'center',
    width: 14,
    paddingVertical: 2,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeDash: {
    flex: 1,
    width: 0,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    minHeight: 20,
    marginVertical: 2,
  },
  routeInfo: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 10,
  },
  routePoint: {},
  routePointLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: `${COLORS.onSurfaceVariant}70`,
    marginBottom: 2,
  },
  routePointValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  // Track items
  trackItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: SPACING.xl,
    marginVertical: SPACING.sm,
    backgroundColor: `${COLORS.surfaceHigh}60`,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  trackItemsText: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
    flex: 1,
  },
  // Progress
  progressSection: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    color: `${COLORS.onSurfaceVariant}60`,
    marginBottom: SPACING.md,
  },
  progressSteps: {},
  progressStep: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  progressStepLeft: {
    alignItems: 'center',
    width: 20,
  },
  progressDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  progressDotCurrent: {
    borderWidth: 2,
    borderColor: COLORS.white,
    ...SHADOWS.md,
  },
  currentPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  progressLine: {
    width: 2,
    height: 28,
    backgroundColor: `${COLORS.outlineVariant}25`,
    borderRadius: 1,
  },
  progressStepContent: {
    flex: 1,
    paddingBottom: SPACING.md,
  },
  progressStepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  progressStepDesc: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
    marginTop: 1,
  },
  // Footer
  trackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.outlineVariant}10`,
  },
  trackPriceLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: `${COLORS.onSurfaceVariant}60`,
  },
  trackPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  trackActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.error}10`,
  },
  cancelBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.error,
  },
  chatBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.secondary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  detailBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  orderIdRow: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  orderIdLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: `${COLORS.onSurfaceVariant}50`,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.huge * 1.5,
    gap: SPACING.md,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: `${COLORS.primary}08`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: `${COLORS.primary}12`,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: '75%',
    lineHeight: 20,
  },
  emptyOrderBtn: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  emptyOrderBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyOrderBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Recently Completed
  recentSection: {
    marginTop: SPACING.lg,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
    letterSpacing: -0.3,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
    gap: SPACING.md,
  },
  recentIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  recentMeta: {
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
    marginTop: 1,
  },
  recentRight: {
    alignItems: 'flex-end',
  },
  recentPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  completedText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.tertiary,
  },
});
