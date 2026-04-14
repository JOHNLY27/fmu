import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { subscribeToRiderJobs, Order } from '../services/orderService';
import { useState, useEffect } from 'react';

export default function RiderProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToRiderJobs(user.uid, (data) => {
      setCompletedCount(data.filter(j => j.status === 'completed').length);
    });
    return () => unsub();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Landing' }],
      });
    } catch (error) {
      console.log('Error logging out: ', error);
    }
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View>
            <Text style={styles.profileLabel}>PREMIUM COURIER</Text>
            <Text style={styles.profileName}>{user?.name || 'Rider'}</Text>
            <Text style={styles.profileSince}>Partner in {user?.location?.city || 'Butuan City'}</Text>
          </View>
          <View style={styles.profileStats}>
            <View style={[styles.statBox, { backgroundColor: COLORS.surfaceHighest }]}>
              <Text style={styles.statBoxValue}>4.9</Text>
              <Ionicons name="star" size={12} color={COLORS.primary} />
            </View>
            <View style={[styles.statBox, { backgroundColor: COLORS.surfaceLow }]}>
              <Text style={styles.statBoxValue}>{completedCount}</Text>
              <Text style={styles.statBoxLabel}>DELIVERIES</Text>
            </View>
          </View>
        </View>

        {/* Performance */}
        <View style={styles.perfRow}>
          <View style={styles.perfCard}>
            <Text style={styles.perfTitle}>Performance Stats</Text>
            <View style={styles.perfGrid}>
              <View>
                <Text style={styles.perfLabel}>Acceptance</Text>
                <Text style={styles.perfValue}>98.2%</Text>
              </View>
              <View>
                <Text style={styles.perfLabel}>On-Time</Text>
                <Text style={styles.perfValue}>94.5%</Text>
              </View>
            </View>
          </View>
          <View style={styles.tierCard}>
            <Ionicons name="ribbon" size={28} color={COLORS.primary} />
            <Text style={styles.tierTitle}>Platinum</Text>
            <Text style={styles.tierDesc}>Top 3% regional</Text>
          </View>
        </View>

        {/* Vehicle */}
        <Text style={styles.sectionTitle}>Vehicle Information</Text>
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleIcon}>
            <Ionicons name="bicycle" size={28} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.vehicleName}>{user?.requirements?.vehicleModel || 'Electric Scooter'}</Text>
            <Text style={styles.vehicleType}>Active Vehicle</Text>
          </View>
        </View>
        <View style={styles.vehicleDetails}>
          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleLabel}>License Plate</Text>
            <Text style={styles.vehicleValue}>{user?.requirements?.vehiclePlateNumber?.toUpperCase() || 'PND-123'}</Text>
          </View>
          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleLabel}>Status</Text>
            <Text style={[styles.vehicleValue, { color: COLORS.tertiary }]}>Approved</Text>
          </View>
        </View>

        {/* Documents */}
        <Text style={styles.sectionTitle}>Documents & Verification</Text>
        {[
          { icon: 'shield-checkmark', label: "Background Check", status: 'verified' },
          { icon: 'document-text', label: "Driver's License", status: 'expires' },
          { icon: 'heart', label: "Health Insurance", status: 'arrow' },
        ].map((doc, i) => (
          <TouchableOpacity key={i} style={styles.docItem}>
            <Ionicons name={doc.icon as any} size={20} color={COLORS.secondary} />
            <Text style={styles.docLabel}>{doc.label}</Text>
            <View style={{ flex: 1 }} />
            {doc.status === 'verified' && (
              <Ionicons name="shield-checkmark" size={16} color={COLORS.tertiary} />
            )}
            {doc.status === 'expires' && (
              <View style={styles.expiresBadge}>
                <Text style={styles.expiresText}>EXPIRES 2026</Text>
              </View>
            )}
            {doc.status === 'arrow' && (
              <Ionicons name="chevron-forward" size={16} color={COLORS.outlineVariant} />
            )}
          </TouchableOpacity>
        ))}

        {/* Settings */}
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.settingsCard}>
          {[
            { icon: 'notifications', label: 'Notification Preferences', sub: 'Sound, vibration, push' },
            { icon: 'map', label: 'Navigation Tools', sub: 'Google Maps or Waze' },
            { icon: 'shield', label: 'Privacy & Security', sub: '2FA and data control' },
          ].map((s, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.settingItem}
              onPress={() => navigation.navigate('GenericContent', { title: s.label })}
            >
              <Ionicons name={s.icon as any} size={22} color={COLORS.onSurfaceVariant} />
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>{s.label}</Text>
                <Text style={styles.settingSub}>{s.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.outlineVariant} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={22} color={COLORS.error} />
            <Text style={[styles.settingLabel, { color: COLORS.error }]}>Log Out</Text>
          </TouchableOpacity>
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
  profileHeader: {
    marginBottom: SPACING.xxl,
  },
  profileLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    color: COLORS.primary,
    marginBottom: 4,
  },
  profileName: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
    color: COLORS.onSurface,
  },
  profileSince: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
    marginTop: 2,
  },
  profileStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  statBox: {
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  statBoxValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statBoxLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 2,
    color: `${COLORS.onSurface}80`,
    marginTop: 2,
  },
  perfRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  perfCard: {
    flex: 2,
    backgroundColor: COLORS.secondary,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  perfTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  perfGrid: {
    flexDirection: 'row',
    gap: SPACING.xxl,
  },
  perfLabel: {
    fontSize: 12,
    color: `${COLORS.white}AA`,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  perfValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  tierCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceHighest,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    justifyContent: 'space-between',
  },
  tierTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  tierDesc: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    backgroundColor: COLORS.surfaceLow,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    marginBottom: 2,
    ...SHADOWS.sm,
  },
  vehicleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surfaceHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  vehicleType: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  vehicleDetails: {
    backgroundColor: COLORS.surfaceLow,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    gap: 8,
    ...SHADOWS.sm,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vehicleLabel: {
    fontSize: 13,
    color: `${COLORS.onSurface}80`,
  },
  vehicleValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surfaceLow,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  docLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  expiresBadge: {
    backgroundColor: COLORS.surfaceHighest,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  expiresText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1,
  },
  settingsCard: {
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.sm,
    marginBottom: SPACING.xxl,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLow,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  settingSub: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 1,
  },
});
