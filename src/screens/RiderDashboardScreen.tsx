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
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { subscribeToAvailableJobs, subscribeToRiderJobs, Order, acceptOrder } from '../services/orderService';
import { Alert } from 'react-native';

export default function RiderDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Order[]>([]);
  const [myCompletedJobs, setMyCompletedJobs] = useState<Order[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToRiderJobs(user.uid, (data) => {
      setMyCompletedJobs(data.filter(j => j.status === 'completed'));
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const unsubscribe = subscribeToAvailableJobs((liveJobs) => {
      setJobs(liveJobs);
    });
    return () => unsubscribe();
  }, []);

  const handleAcceptJob = async (orderId: string) => {
    if (!user) return;
    try {
      const success = await acceptOrder(orderId, user.uid);
      if (success) {
        Alert.alert("Job Accepted!", "You are now assigned to this request.", [
          { text: "OK", onPress: () => navigation.navigate('TrackingDetail', { orderId }) }
        ]);
      } else {
        Alert.alert("Too Late", "Someone else took this job.");
      }
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status Toggle */}
        <View style={styles.statusCard}>
          <View>
            <Text style={styles.statusTitle}>System Status</Text>
            <Text style={styles.statusSubtitle}>Switch to go live and receive jobs</Text>
          </View>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleTrack}>
              <View style={styles.toggleThumb} />
            </View>
            <Text style={styles.toggleLabel}>ONLINE</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardLarge]}>
            <Text style={styles.statLabel}>TODAY'S REVENUE</Text>
            <Text style={styles.statValue}>₱{myCompletedJobs.reduce((sum, j) => sum + (j.price || 0), 0).toFixed(2)}</Text>
            <View style={styles.statTrend}>
              <Ionicons name="cellular-outline" size={14} color={COLORS.tertiary} />
              <Text style={styles.statTrendText}>Live Session</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>COMPLETED</Text>
            <Text style={styles.statNumber}>{myCompletedJobs.length}</Text>
            <Text style={styles.statUnit}>Deliveries</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>ONLINE TIME</Text>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statUnit}>Hours</Text>
          </View>
        </View>

        {/* Active Jobs */}
        <View style={styles.jobsHeader}>
          <Text style={styles.jobsTitle}>ACTIVE JOBS</Text>
          <View style={styles.nearYouBadge}>
            <Text style={styles.nearYouText}>NEAR YOU</Text>
          </View>
        </View>

        {jobs.length === 0 && (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="moon" size={40} color={COLORS.outlineVariant} />
            <Text style={{ marginTop: 10, color: COLORS.onSurfaceVariant }}>No pending jobs right now.</Text>
          </View>
        )}

        {jobs.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <Image 
              source={{ uri: job.type === 'pabili' 
                ? 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&fit=crop'
                : job.type === 'food' 
                  ? 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=400&fit=crop' 
                  : 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&fit=crop' }} 
              style={styles.jobImage} 
              resizeMode="cover" 
            />
            {/* Type Badge */}
            <View style={styles.typeBadge}>
              <Ionicons
                name={job.type === 'pabili' ? 'bag-handle' : job.type === 'food' ? 'restaurant' : 'car'}
                size={12}
                color={job.type === 'pabili' ? COLORS.tertiary : job.type === 'food' ? COLORS.primary : COLORS.secondary}
              />
              <Text style={styles.typeBadgeText}>{job.type === 'pabili' ? 'PABILI' : job.type}</Text>
            </View>
            
            <View style={styles.priorityBadge}>
              <Ionicons name="flash" size={10} color={COLORS.white} />
              <Text style={styles.priorityText}>NEW</Text>
            </View>
            
            {/* Job Info */}
            <View style={styles.jobInfo}>
              <View style={styles.jobInfoHeader}>
                <Text style={styles.jobTitle}>
                  {job.type === 'pabili' ? '🛍️ Pabili Request' : 
                   job.type === 'food' ? '🍽️ Food Delivery' : 
                   job.type === 'parcel' ? '📦 Parcel Delivery' : '🚗 Ride Request'}
                </Text>
                <Text style={styles.jobAmount}>₱{job.price?.toFixed(2) || '0.00'}</Text>
              </View>
              <View style={styles.jobMeta}>
                <View style={styles.jobMetaItem}>
                  <Ionicons name="map" size={14} color={COLORS.onSurfaceVariant} />
                  <Text style={styles.jobMetaText}>Pickup: {job.pickupLocation}</Text>
                </View>
                <View style={styles.jobMetaItem}>
                  <Ionicons name="location" size={14} color={COLORS.onSurfaceVariant} />
                  <Text style={styles.jobMetaText}>Drop: {job.dropoffLocation}</Text>
                </View>
              </View>

              {job.itemDetails && (
                <View style={styles.jobItemsBox}>
                  <Text style={styles.jobItemsLabel}>Customer Order:</Text>
                  <Text style={styles.jobItemsText}>{job.itemDetails}</Text>
                </View>
              )}
              <Button
                title={`Accept Request`}
                onPress={() => handleAcceptJob(job.id!)}
                size="md"
                fullWidth
                style={{ marginTop: SPACING.md }}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Map Button */}
      <TouchableOpacity style={styles.floatingMapBtn}>
        <Ionicons name="map" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: SPACING.xl,
    paddingBottom: 100,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  statusSubtitle: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleTrack: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  toggleLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surfaceLow,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
  },
  statCardLarge: {
    width: '100%',
    flex: undefined,
    minWidth: '100%',
    backgroundColor: COLORS.surfaceHighest,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.onSurfaceVariant,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  statTrendText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.tertiary,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  statUnit: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  jobsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  jobsTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontStyle: 'italic',
    color: COLORS.onSurface,
    textTransform: 'uppercase',
  },
  nearYouBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  nearYouText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 2,
  },
  jobCard: {
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  jobImage: {
    width: '100%',
    height: 140,
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${COLORS.white}EE`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    ...SHADOWS.sm,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  priorityBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    ...SHADOWS.md,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 1,
  },
  jobInfo: {
    padding: SPACING.xl,
  },
  jobInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    flex: 1,
  },
  jobAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  jobMeta: {
    gap: 8,
  },
  jobMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobMetaText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  jobItemsBox: {
    marginTop: SPACING.md,
    backgroundColor: `${COLORS.secondary}10`,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  jobItemsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  jobItemsText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  floatingMapBtn: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
});
