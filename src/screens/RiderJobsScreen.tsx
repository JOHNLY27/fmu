import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { subscribeToRiderJobs, updateOrderStatus, Order } from '../services/orderService';
import Button from '../components/ui/Button';

export default function RiderJobsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToRiderJobs(user.uid, (data) => {
      setJobs(data);
    });
    return () => unsubscribe();
  }, [user]);

  const activeJobs = jobs.filter(j => ['accepted', 'picked_up'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'completed');

  const displayedJobs = activeTab === 'active' ? activeJobs : completedJobs;

  const handleUpdateStatus = (job: Order) => {
    let nextStatus: 'picked_up' | 'completed' = 'picked_up';
    let prompt = "Have you picked up the items and are heading to the customer?";
    if (job.status === 'picked_up') {
      nextStatus = 'completed';
      prompt = "Have you successfully delivered the items to the customer?";
    }

    Alert.alert(
      "Update Order Status",
      prompt,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Update", 
          onPress: async () => {
            try {
              await updateOrderStatus(job.id!, nextStatus);
            } catch (e) {
              Alert.alert("Error", "Could not update status.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>YOUR ASSIGNMENTS</Text>
        <Text style={styles.headerTitle}>My Jobs</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active ({activeJobs.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {displayedJobs.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name={activeTab === 'active' ? "bicycle-outline" : "checkmark-done-circle-outline"} size={48} color={`${COLORS.onSurfaceVariant}40`} />
            <Text style={styles.emptyTitle}>
              {activeTab === 'active' ? "No active jobs" : "No completed jobs yet"}
            </Text>
            <Text style={styles.emptyDesc}>
              {activeTab === 'active' 
                ? "Go to the Dashboard to accept new incoming requests near you." 
                : "Your delivered orders will appear here over time."}
            </Text>
            {activeTab === 'active' && (
              <Button 
                title="Find Jobs on Dashboard" 
                onPress={() => navigation.navigate('Dashboard')} 
                style={{ marginTop: SPACING.md }}
              />
            )}
          </View>
        )}

        {displayedJobs.map(job => (
          <View key={job.id} style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <View>
                <Text style={styles.jobTitle}>
                  {job.type === 'pabili' ? '🛍️ Pabili Request' : 
                   job.type === 'food' ? '🍽️ Food Delivery' : 
                   job.type === 'parcel' ? '📦 Parcel Delivery' : '🚗 Ride Request'}
                </Text>
                <Text style={styles.jobTime}>
                  Order #{job.id?.substring(0,6).toUpperCase()}
                </Text>
              </View>
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>₱{job.price?.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.locations}>
              <View style={styles.locRow}>
                <Ionicons name="storefront" size={14} color={COLORS.secondary} />
                <Text style={styles.locText}><Text style={styles.boldText}>Pickup:</Text> {job.pickupLocation}</Text>
              </View>
              <View style={styles.locRow}>
                <Ionicons name="home" size={14} color={COLORS.primary} />
                <Text style={styles.locText}><Text style={styles.boldText}>Dropoff:</Text> {job.dropoffLocation}</Text>
              </View>
            </View>

            {job.itemDetails && (
              <View style={styles.itemsBox}>
                <Text style={styles.itemsBoxLabel}>Customer Order / Items:</Text>
                <Text style={styles.itemsBoxText}>{job.itemDetails}</Text>
              </View>
            )}

            {/* Rider Controls */}
            {activeTab === 'active' && (
              <View style={styles.controls}>
                {/* Chat and Call block */}
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('Chat', { orderId: job.id })}
                  >
                    <Ionicons name="chatbubbles" size={16} color={COLORS.secondary} />
                    <Text style={styles.actionBtnText}>Chat Customer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="call" size={16} color={COLORS.primary} />
                    <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Call</Text>
                  </TouchableOpacity>
                </View>

                {/* Status Update */}
                <Button 
                  title={job.status === 'accepted' ? "Mark as Picked Up" : "Mark as Delivered"}
                  onPress={() => handleUpdateStatus(job)}
                  size="md"
                  fullWidth
                />
              </View>
            )}

            {activeTab === 'completed' && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.tertiary} />
                <Text style={styles.completedText}>Successfully Delivered</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 54,
    paddingBottom: SPACING.md,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 40,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginTop: 10,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 5,
    lineHeight: 20,
  },
  jobCard: {
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}20`,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  jobTime: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  priceTag: {
    backgroundColor: `${COLORS.primary}12`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
  },
  locations: {
    gap: 6,
    marginBottom: SPACING.md,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  locText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    flex: 1,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  itemsBox: {
    backgroundColor: `${COLORS.secondary}10`,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  itemsBoxLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  itemsBoxText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  controls: {
    borderTopWidth: 1,
    borderTopColor: `${COLORS.outlineVariant}15`,
    paddingTop: SPACING.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: `${COLORS.surfaceHigh}`,
    borderRadius: RADIUS.full,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: `${COLORS.tertiary}12`,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  completedText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.tertiary,
  },
});
