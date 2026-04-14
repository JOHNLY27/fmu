import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Button from '../components/ui/Button';
import { Order, subscribeToOrder } from '../services/orderService';

export default function TrackingScreen({ navigation, route }: any) {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const unsubscribe = subscribeToOrder(orderId, (data) => {
      setOrder(data);
    });
    return () => unsubscribe();
  }, [orderId]);

  const isPending = order?.status === 'pending';
  const isAccepted = order?.status === 'accepted' || order?.status === 'picked_up';
  const isCompleted = order?.status === 'completed';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Map Section */}
      <View style={styles.mapSection}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=500&fit=crop' }}
          style={styles.mapImage}
          resizeMode="cover"
        />
        {/* Back Button */}
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Rider Info Card */}
        <View style={styles.riderCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }}
            style={styles.riderAvatar}
          />
          <View>
            <Text style={styles.riderLabel}>{isPending ? 'SEARCHING...' : 'YOUR RUNNER'}</Text>
            <Text style={styles.riderName}>{isPending ? 'Waiting for match' : 'Marcus J.'}</Text>
          </View>
          <View style={styles.riderBikeIcon}>
            <Ionicons name="bicycle" size={16} color={COLORS.secondary} />
          </View>
        </View>
      </View>

      {/* Bottom Panel */}
      <ScrollView
        style={styles.panel}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.panelContent}
      >
        <View style={styles.panelHandle} />

        {/* Status Header */}
        <View style={styles.statusHeader}>
          <View>
            <Text style={styles.statusTitle}>
              {isPending ? 'Finding Rider...' : isCompleted ? 'Order Complete' : 'Heading to You'}
            </Text>
            <View style={styles.statusLive}>
              <View style={styles.liveDot}>
                <View style={styles.liveDotInner} />
              </View>
              <Text style={styles.statusEta}>
                {isPending ? 'Locating...' : 'Arriving in 12 mins'}
              </Text>
            </View>
          </View>
          <View style={styles.orderId}>
            <Text style={styles.orderIdLabel}>ORDER ID</Text>
            <Text style={styles.orderIdValue}>
              #{orderId ? orderId.substring(0, 6).toUpperCase() : 'VL-8829'}
            </Text>
          </View>
        </View>

        {/* Order Details Summary */}
        <View style={styles.requestCard}>
          <Text style={styles.requestLabel}>ROUTE SUMMARY</Text>
          <View style={styles.routeRow}>
            <View style={styles.routeIcon}>
              <View style={[styles.routeDot, { backgroundColor: COLORS.secondary }]} />
              <View style={styles.routeLine} />
              <View style={[styles.routeDot, { backgroundColor: COLORS.primary }]} />
            </View>
            <View style={styles.routeText}>
              <Text style={styles.locationTitle}>PICKUP</Text>
              <Text style={styles.locationValue}>{order?.pickupLocation || 'Loading...'}</Text>
              <View style={{ height: 16 }} />
              <Text style={styles.locationTitle}>DROPOFF</Text>
              <Text style={styles.locationValue}>{order?.dropoffLocation || 'Loading...'}</Text>
            </View>
          </View>
          
          <View style={[styles.requestTags, { marginTop: 16 }]}>
            <View style={styles.tag}>
              <Ionicons name="cube" size={12} color={COLORS.onSurfaceVariant} />
              <Text style={styles.tagText}>{order?.type.toUpperCase()}</Text>
            </View>
            <View style={styles.tag}>
              <Ionicons name="cash" size={12} color={COLORS.onSurfaceVariant} />
              <Text style={styles.tagText}>${order?.price.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLine} />
          <View style={[styles.progressLineFill, { height: order?.status === 'completed' ? '100%' : order?.status === 'accepted' || order?.status === 'picked_up' ? '50%' : '0%' }]} />

          {/* Step 1 - Requested */}
          <View style={styles.step}>
            <View style={[styles.stepDot, { backgroundColor: COLORS.secondary }]} />
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: COLORS.secondary }]}>Order Requested</Text>
              <Text style={styles.stepMeta}>We are searching for a rider nearby</Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.tertiary} />
          </View>

          {/* Step 2 - Active */}
          <View style={[styles.step, isPending && { opacity: 0.4 }]}>
            <View style={[styles.stepDot, isAccepted || isCompleted ? styles.stepDotActive : { backgroundColor: COLORS.surfaceHigh }]} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Rider En Route</Text>
              <Text style={styles.stepMeta}>
                {isPending ? 'Waiting for rider assignment' : isCompleted ? 'Rider arrived' : 'Marcus is picking up your items'}
              </Text>
            </View>
            {(isAccepted || isCompleted) && <Ionicons name="checkmark-circle" size={20} color={COLORS.tertiary} />}
          </View>

          {/* Step 3 - Pending */}
          <View style={[styles.step, !isCompleted && { opacity: 0.4 }]}>
            <View style={[styles.stepDot, isCompleted ? styles.stepDotActive : { backgroundColor: COLORS.surfaceHigh }]} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Delivered</Text>
              <Text style={styles.stepMeta}>{isCompleted ? 'Successfully delivered' : 'Pending delivery'}</Text>
            </View>
            {isCompleted && <Ionicons name="checkmark-circle" size={20} color={COLORS.tertiary} />}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Button
            title="Chat with Rider"
            onPress={() => navigation.navigate('Chat', { orderId })}
            size="md"
            fullWidth
            icon={<Ionicons name="chatbubble" size={18} color={COLORS.white} />}
          />
        </View>

        <View style={styles.paymentCard}>
          <View style={styles.visaBadge}>
            <Text style={styles.visaText}>VISA</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.paymentLabel}>PAYMENT METHOD</Text>
            <Text style={styles.paymentValue}>•••• 4412</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={`${COLORS.onSurface}30`} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  mapSection: {
    height: 300,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  navButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  riderCard: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${COLORS.surfaceLowest}EE`,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    ...SHADOWS.lg,
  },
  riderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  riderLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 2,
    color: `${COLORS.primary}BB`,
  },
  riderName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  riderBikeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    backgroundColor: COLORS.surface,
    ...SHADOWS.lg,
  },
  panelContent: {
    padding: SPACING.xl,
    paddingBottom: 100,
  },
  panelHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: `${COLORS.outlineVariant}40`,
    alignSelf: 'center',
    marginBottom: SPACING.xxl,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xxl,
  },
  statusTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: COLORS.onSurface,
    marginBottom: 6,
  },
  statusLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: `${COLORS.primary}30`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  statusEta: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  orderId: {
    alignItems: 'flex-end',
  },
  orderIdLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: `${COLORS.onSurface}50`,
    marginBottom: 2,
  },
  orderIdValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    fontFamily: 'monospace',
  },
  requestCard: {
    backgroundColor: COLORS.surfaceLow,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xxl,
  },
  requestLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: `${COLORS.onSurface}80`,
    marginBottom: 10,
  },
  requestText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    color: COLORS.onSurface,
    marginBottom: 14,
  },
  requestTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceHighest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  progressContainer: {
    paddingLeft: 16,
    marginBottom: SPACING.xxl,
    position: 'relative',
    gap: SPACING.xxl,
  },
  progressLine: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 2,
  },
  progressLineFill: {
    position: 'absolute',
    left: 20,
    top: 0,
    width: 3,
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: COLORS.surface,
    zIndex: 1,
  },
  stepDotActive: {
    backgroundColor: COLORS.secondary,
    borderWidth: 3,
    borderColor: COLORS.surface,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  stepMeta: {
    fontSize: 11,
    color: `${COLORS.onSurface}80`,
    marginTop: 2,
  },
  actionRow: {
    marginBottom: SPACING.lg,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surfaceLow,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.full,
  },
  visaBadge: {
    width: 40,
    height: 24,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visaText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
  },
  paymentLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: `${COLORS.onSurface}50`,
  },
  paymentValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  routeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  routeIcon: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: `${COLORS.outlineVariant}40`,
    marginVertical: 4,
  },
  routeText: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.onSurfaceVariant,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
});
