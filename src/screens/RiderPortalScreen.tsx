import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export default function RiderPortalScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [province, setProvince] = useState('Agusan del Norte');
  const [city, setCity] = useState('Butuan City');
  const [barangay, setBarangay] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      if (activeTab === 'login') {
        await signIn(email, password);
      } else {
        if (!name || !province || !city || !licenseNumber || !vehiclePlateNumber || !vehicleModel) {
          Alert.alert('Error', 'Please provide your name, location, and all vehicle requirements.');
          setLoading(false);
          return;
        }
        await signUp(
          name, 
          email, 
          password, 
          'rider', 
          {
            country: 'Philippines',
            province,
            city,
            barangay
          },
          {
            licenseNumber,
            vehiclePlateNumber,
            vehicleModel
          }
        );
      }
      navigation.reset({
        index: 0,
        routes: [{ name: 'RiderTabs' }],
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  // Demo mode
  const handleDemoAccess = () => {
    navigation.reset({
        index: 0,
        routes: [{ name: 'RiderTabs' }],
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroLabel}>PARTNER WITH US</Text>
          <Text style={styles.heroTitle}>
            Drive and <Text style={styles.heroHighlight}>Earn</Text>.
          </Text>
          <Text style={styles.heroDesc}>
            Turn your gears into earnings. Join the elite network of Fetch Me Up riders and enjoy total flexibility with premium rewards.
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.featureGrid}>
          <View style={[styles.featureCard, { backgroundColor: COLORS.surfaceLow }]}>
            <Ionicons name="wallet" size={28} color={COLORS.secondary} />
            <Text style={styles.featureText}>Weekly Payouts</Text>
          </View>
          <View style={[styles.featureCard, { backgroundColor: COLORS.secondaryContainer }]}>
            <Ionicons name="calendar" size={28} color={COLORS.onSurface} />
            <Text style={styles.featureText}>Your Schedule</Text>
          </View>
        </View>

        {/* Testimonial */}
        <View style={styles.testimonialCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' }}
            style={styles.testimonialAvatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.testimonialQuote}>
              "The best platform for high-value deliveries. I doubled my earnings in a month."
            </Text>
            <Text style={styles.testimonialAuthor}>— Marco, Pro Rider</Text>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.formCard}>
          {/* Tab */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={activeTab === 'login' ? styles.activeTab : styles.inactiveTab}
              onPress={() => setActiveTab('login')}
            >
              <Text style={activeTab === 'login' ? styles.activeTabText : styles.inactiveTabText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={activeTab === 'signup' ? styles.activeTab : styles.inactiveTab}
              onPress={() => setActiveTab('signup')}
            >
              <Text style={activeTab === 'signup' ? styles.activeTabText : styles.inactiveTabText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Rider Portal</Text>
            <Text style={styles.formSubtitle}>Ready for your next trip?</Text>
          </View>

          <View style={styles.formFields}>
            {activeTab === 'signup' && (
              <Input
                label="Full Name"
                placeholder="Marcus J."
                value={name}
                onChangeText={setName}
              />
            )}
            <Input
              label="Email Address"
              placeholder="rider@fetchmeup.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {activeTab === 'signup' && (
              <View style={{ gap: SPACING.md, marginTop: SPACING.sm }}>
                <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 2, color: COLORS.onSurfaceVariant }}>PRIMARY LOCATION</Text>
                <Input
                  label="Province"
                  placeholder="e.g. Agusan del Norte"
                  value={province}
                  onChangeText={setProvince}
                />
                <Input
                  label="City / Municipality"
                  placeholder="e.g. Butuan City"
                  value={city}
                  onChangeText={setCity}
                />
                <Input
                  label="Barangay (Optional)"
                  placeholder="e.g. Libertad"
                  value={barangay}
                  onChangeText={setBarangay}
                />

                <View style={styles.dividerLine} />
                <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 2, color: COLORS.onSurfaceVariant }}>DRIVER REQUIREMENTS</Text>
                
                <Input
                  label="Driver's License Number"
                  placeholder="e.g. N01-12-123456"
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                />
                <Input
                  label="Vehicle Plate Number"
                  placeholder="e.g. ABC 1234"
                  value={vehiclePlateNumber}
                  onChangeText={setVehiclePlateNumber}
                />
                <Input
                  label="Vehicle Model"
                  placeholder="e.g. Honda Click 125i"
                  value={vehicleModel}
                  onChangeText={setVehicleModel}
                />
              </View>
            )}

            {activeTab === 'login' && (
              <View style={styles.rememberRow}>
                <View style={styles.checkboxRow}>
                  <View style={styles.checkbox} />
                  <Text style={styles.rememberText}>Remember me</Text>
                </View>
                <TouchableOpacity>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
            )}

            <Button
              title={activeTab === 'login' ? "Access Portal" : "Apply as Partner"}
              onPress={handleAuth}
              size="xl"
              fullWidth
              loading={loading}
              icon={<Ionicons name="arrow-forward" size={22} color={COLORS.white} />}
            />

            <Button
              title="Demo Access"
              onPress={handleDemoAccess}
              size="md"
              fullWidth
              variant="outline"
              icon={<Ionicons name="flash" size={18} color={COLORS.onSurface} />}
            />
          </View>

          {activeTab === 'login' && (
            <>
              <View style={styles.becomeDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>BECOME A RIDER</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Apply to be a Partner"
                onPress={() => setActiveTab('signup')}
                variant="outline"
                size="md"
                fullWidth
                icon={<Ionicons name="bicycle" size={22} color={COLORS.secondary} />}
              />
            </>
          )}
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
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 50,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: SPACING.xxl,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    color: COLORS.primary,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
    color: COLORS.onSurface,
    lineHeight: 46,
    marginBottom: SPACING.md,
  },
  heroHighlight: {
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  heroDesc: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
    lineHeight: 24,
  },
  featureGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  featureCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    gap: SPACING.md,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  featureText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  testimonialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    backgroundColor: COLORS.surfaceHighest,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xxl,
  },
  testimonialAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  testimonialQuote: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
    color: COLORS.onSurface,
    lineHeight: 19,
  },
  testimonialAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    ...SHADOWS.md,
    gap: SPACING.xl,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: RADIUS.full,
    padding: 4,
  },
  activeTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLowest,
    ...SHADOWS.sm,
    alignItems: 'center',
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  inactiveTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  inactiveTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: `${COLORS.onSurfaceVariant}80`,
  },
  formHeader: {
    alignItems: 'center',
    gap: 4,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },
  formFields: {
    gap: SPACING.lg,
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
  },
  rememberText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  becomeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.surfaceHigh,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: `${COLORS.onSurfaceVariant}50`,
  },
});
