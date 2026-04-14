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

export default function UserProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();

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
          <View style={styles.avatarCircle}>
             <Text style={styles.avatarLetter}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileRole}>CUSTOMER ACCOUNT</Text>
            <Text style={styles.profileName} numberOfLines={1}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail} numberOfLines={1}>{user?.email}</Text>
          </View>
        </View>

        {/* Location / Default Address */}
        <Text style={styles.sectionTitle}>Home Address</Text>
        <View style={styles.infoCard}>
          <View style={styles.iconBox}>
            <Ionicons name="home" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>
              {user?.location?.city || 'City not set'}, {user?.location?.province || 'Province'}
            </Text>
            <Text style={styles.infoSub}>Default delivery area</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('AddressEdit')}>
             <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Links */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.settingsGroup}>
          {[
            { icon: 'time-outline', label: 'Order History', dest: 'Activity' },
            { icon: 'heart-outline', label: 'Saved Stores' },
            { icon: 'card-outline', label: 'Payment Methods' },
            { icon: 'gift-outline', label: 'Promos & Vouchers' },
          ].map((item, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.settingItem}
              onPress={() => navigation.navigate(item.dest || 'GenericContent', { title: item.label })}
            >
              <Ionicons name={item.icon as any} size={22} color={COLORS.onSurfaceVariant} />
              <Text style={styles.settingLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.outlineVariant} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Support & About</Text>
        <View style={styles.settingsGroup}>
          {[
            { icon: 'chatbubbles-outline', label: 'Help Center' },
            { icon: 'document-text-outline', label: 'Terms of Service' },
            { icon: 'shield-outline', label: 'Privacy Policy' },
          ].map((item, i) => (
            <TouchableOpacity 
              key={i} 
              style={[
                styles.settingItem, 
                i === 2 && { borderBottomWidth: 0 }
              ]}
              onPress={() => navigation.navigate('GenericContent', { title: item.label })}
            >
              <Ionicons name={item.icon as any} size={22} color={COLORS.onSurfaceVariant} />
              <Text style={styles.settingLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.outlineVariant} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
  },
  profileRole: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.primary,
    marginBottom: 4,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLowest,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}20`,
    marginBottom: SPACING.lg,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  infoSub: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  editText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  settingsGroup: {
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}15`,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.outlineVariant}20`,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: `${COLORS.error}10`,
    paddingVertical: SPACING.xl,
    borderRadius: RADIUS.xl,
    marginTop: 40,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: `${COLORS.error}25`,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.error,
  },
});
