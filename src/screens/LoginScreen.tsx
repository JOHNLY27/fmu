import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [province, setProvince] = useState('Agusan del Norte');
  const [city, setCity] = useState('Butuan City');
  const [barangay, setBarangay] = useState('');
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
        if (!name || !province || !city) {
          Alert.alert('Error', 'Please provide your name, province, and city.');
          setLoading(false);
          return;
        }
        await signUp(name, email, password, 'user', {
          country: 'Philippines',
          province,
          city,
          barangay
        });
      }
      
      // Navigate to dashboard upon successful login/signup!
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
      
    } catch (error: any) {
      Alert.alert('Auth Error', error.message || 'An error occurred');
    }
    setLoading(false);
  };

  // Demo mode: skip auth
  const handleDemoMode = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Fetch Me Up</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', `${COLORS.primary}CC`]}
            style={styles.heroGradient}
          />
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>The Kinetic{'\n'}Experience.</Text>
            <Text style={styles.heroSubtitle}>
              Your premium portal for logistics, curated for the modern mover.
            </Text>
          </View>
        </View>

        {/* Auth Form */}
        <View style={styles.formContainer}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeLabel}>
              {activeTab === 'login' ? 'WELCOME BACK' : 'GET STARTED'}
            </Text>
            <Text style={styles.formTitle}>
              {activeTab === 'login' ? 'Sign In to Your Journey' : 'Create Your Account'}
            </Text>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'login' && styles.activeTab]}
              onPress={() => setActiveTab('login')}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
              onPress={() => setActiveTab('signup')}
            >
              <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.fields}>
            {activeTab === 'signup' && (
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
                icon={<Ionicons name="person-outline" size={20} color={COLORS.onSurfaceVariant} />}
              />
            )}

            <Input
              label="Email Address"
              placeholder="alex@fetchmeup.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Ionicons name="mail-outline" size={20} color={COLORS.onSurfaceVariant} />}
            />

            <View>
              {activeTab === 'login' && (
                <View style={styles.passwordHeader}>
                  <Text style={styles.fieldLabel}>PASSWORD</Text>
                  <TouchableOpacity>
                    <Text style={styles.forgotText}>Forgot?</Text>
                  </TouchableOpacity>
                </View>
              )}
              <Input
                label={activeTab === 'signup' ? 'Password' : undefined}
                placeholder="••••••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                icon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.onSurfaceVariant} />}
              />
            </View>

            {activeTab === 'signup' && (
              <View style={{ gap: SPACING.md, marginTop: SPACING.sm }}>
                <Text style={styles.fieldLabel}>PRIMARY LOCATION</Text>
                <Input
                  label="Province"
                  placeholder="e.g. Agusan del Norte"
                  value={province}
                  onChangeText={setProvince}
                  icon={<Ionicons name="map-outline" size={20} color={COLORS.onSurfaceVariant} />}
                />
                <Input
                  label="City / Municipality"
                  placeholder="e.g. Butuan City"
                  value={city}
                  onChangeText={setCity}
                  icon={<Ionicons name="business-outline" size={20} color={COLORS.onSurfaceVariant} />}
                />
                <Input
                  label="Barangay (Optional)"
                  placeholder="e.g. Libertad"
                  value={barangay}
                  onChangeText={setBarangay}
                  icon={<Ionicons name="home-outline" size={20} color={COLORS.onSurfaceVariant} />}
                />
              </View>
            )}

            <Button
              title={activeTab === 'login' ? 'Continue to Dashboard' : 'Create Account'}
              onPress={handleAuth}
              size="lg"
              fullWidth
              loading={loading}
              icon={<Ionicons name="arrow-forward" size={20} color={COLORS.white} />}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={20} color={COLORS.onSurface} />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={20} color={COLORS.onSurface} />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Demo Mode Button */}
          <TouchableOpacity style={styles.demoButton} onPress={handleDemoMode}>
            <Ionicons name="flash" size={16} color={COLORS.tertiary} />
            <Text style={styles.demoText}>Try Demo Mode (No login needed)</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By signing in, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 40,
  },
  heroContainer: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.xxl,
    height: 220,
    ...SHADOWS.lg,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: `${COLORS.white}DD`,
    fontWeight: '500',
    lineHeight: 20,
  },
  formContainer: {
    gap: SPACING.xl,
  },
  welcomeSection: {
    gap: 4,
  },
  welcomeLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    color: COLORS.primary,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: COLORS.onSurface,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: RADIUS.full,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.surfaceHighest,
    ...SHADOWS.sm,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: `${COLORS.onSurface}80`,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  fields: {
    gap: SPACING.lg,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.onSurfaceVariant,
  },
  forgotText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: `${COLORS.outlineVariant}30`,
  },
  dividerText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 3,
    color: `${COLORS.onSurfaceVariant}50`,
  },
  socialRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}20`,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: `${COLORS.tertiaryContainer}30`,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: `${COLORS.tertiary}20`,
  },
  demoText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.tertiary,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
