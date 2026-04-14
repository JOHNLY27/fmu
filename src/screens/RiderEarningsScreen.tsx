import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { subscribeToRiderJobs, Order } from '../services/orderService';

export default function RiderEarningsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [completedJobs, setCompletedJobs] = useState<Order[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToRiderJobs(user.uid, (data) => {
      setCompletedJobs(data.filter(j => j.status === 'completed'));
    });
    return () => unsub();
  }, [user]);

  const totalRevenue = completedJobs.reduce((sum, j) => sum + (j.price || 0), 0);

  const weeklyBars = [
    { day: 'Mon', height: 0 },
    { day: 'Tue', height: 0 },
    { day: 'Wed', height: 0 },
    { day: 'Thu', height: 0 },
    { day: 'Fri', height: 0 },
    { day: 'Sat', height: 0 },
    { day: 'Sun', height: 0 },
  ];

  completedJobs.forEach(job => {
    if (job.createdAt) {
      const date = job.createdAt.toDate ? job.createdAt.toDate() : new Date(job.createdAt.seconds * 1000);
      const dayIndex = date.getDay(); // 0 is Sun
      const mapping = [6, 0, 1, 2, 3, 4, 5]; // Map Sun to end of array (index 6)
      weeklyBars[mapping[dayIndex]].height += (job.price || 0);
    }
  });

  const maxBarHeight = Math.max(...weeklyBars.map(b => b.height), 1); // Avoid division by 0

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Revenue Card */}
        <LinearGradient
          colors={[COLORS.primaryGradientStart, COLORS.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.revenueCard}
        >
          <View style={styles.revenueGlow} />
          <Text style={styles.revenueLabel}>THIS WEEK'S REVENUE</Text>
          <View style={styles.revenueRow}>
            <Text style={styles.revenueAmount}>₱{totalRevenue.toFixed(2)}</Text>
            <View style={styles.trendBadge}>
              <Ionicons name="trending-up" size={14} color={COLORS.tertiaryContainer} />
              <Text style={styles.trendText}>12%</Text>
            </View>
          </View>
          <View style={styles.revenueBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>TIPS</Text>
              <Text style={styles.breakdownValue}>₱0.00</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>SURGE</Text>
              <Text style={styles.breakdownValue}>₱0.00</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Earnings Chart */}
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Earnings Pulse</Text>
          <Text style={styles.chartDate}>Aug 21 - Aug 27</Text>
        </View>

        <View style={styles.chartContainer}>
          {weeklyBars.map((bar, i) => (
            <View key={i} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                {bar.surge && (
                  <View style={styles.surgeLabel}>
                    <Text style={styles.surgeLabelText}>Surge Max</Text>
                  </View>
                )}
                {bar.height > 0 ? (
                  <LinearGradient
                    colors={[COLORS.primaryLight, COLORS.primary]}
                    style={[styles.bar, { height: (bar.height / maxBarHeight) * 120 + 20 }]}
                  />
                ) : (
                  <View
                    style={[styles.bar, styles.barInactive, { height: 20 }]}
                  />
                )}
              </View>
              <Text style={styles.barDay}>
                {bar.day}
              </Text>
            </View>
          ))}
        </View>

        {/* Insight Cards */}
        <View style={styles.insightRow}>
          <View style={[styles.insightCard, { backgroundColor: COLORS.secondaryContainer }]}>
            <Ionicons name="flash" size={18} color={COLORS.secondary} />
            <Text style={styles.insightTitle}>Surge Master</Text>
            <Text style={styles.insightDesc}>40% more during peak hours this week.</Text>
          </View>
          <View style={[styles.insightCard, { backgroundColor: COLORS.surfaceHighest }]}>
            <Ionicons name="star" size={18} color={COLORS.primary} />
            <Text style={styles.insightTitle}>Top Rated</Text>
            <Text style={styles.insightDesc}>5.0 rating in 24 trips, +15% tips.</Text>
          </View>
        </View>

        {/* Recent Payouts */}
        <View style={styles.payoutsHeader}>
          <Text style={styles.payoutsTitle}>Recent Payouts</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        {/* Payouts */}
        <View style={styles.payoutsHeader}>
          <Text style={styles.payoutsTitle}>Recent Payouts</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        <View style={{ paddingVertical: 30, alignItems: 'center' }}>
           <Ionicons name="wallet-outline" size={32} color={`${COLORS.onSurfaceVariant}40`} />
           <Text style={{ marginTop: 10, color: COLORS.onSurfaceVariant, fontWeight: '500' }}>No payouts processed yet</Text>
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
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 16,
    paddingBottom: 100,
  },
  revenueCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    marginBottom: SPACING.xxl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  revenueGlow: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: `${COLORS.white}10`,
  },
  revenueLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    color: `${COLORS.white}CC`,
    marginBottom: 8,
  },
  revenueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: SPACING.lg,
  },
  revenueAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.tertiaryContainer,
  },
  revenueBreakdown: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  breakdownItem: {
    flex: 1,
    backgroundColor: `${COLORS.white}15`,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  breakdownLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: `${COLORS.white}AA`,
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.lg,
  },
  chartTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  chartDate: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    backgroundColor: COLORS.surfaceLow,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    marginBottom: SPACING.xxl,
    ...SHADOWS.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '65%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barInactive: {
    backgroundColor: `${COLORS.primary}25`,
  },
  barDay: {
    fontSize: 9,
    fontWeight: '700',
    color: `${COLORS.onSurface}50`,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  surgeLabel: {
    position: 'absolute',
    top: -24,
    backgroundColor: COLORS.onSurface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    zIndex: 1,
  },
  surgeLabelText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  insightRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  insightCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: 6,
    ...SHADOWS.sm,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  insightDesc: {
    fontSize: 11,
    color: `${COLORS.onSurface}AA`,
    lineHeight: 16,
  },
  payoutsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  payoutsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  payoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  payoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutType: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  payoutDate: {
    fontSize: 10,
    color: `${COLORS.onSurface}60`,
    fontWeight: '500',
    letterSpacing: 1,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  payoutAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  payoutStatus: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 2,
  },
});
