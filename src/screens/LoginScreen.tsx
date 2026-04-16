import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [province, setProvince] = useState('Agusan del Norte');
  const [city, setCity] = useState('Butuan City');
  const [barangay, setBarangay] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, signUp } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Load saved email if rememberMe was previously active
  useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('saved_email');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (e) {
        console.log('Error loading saved email:', e);
      }
    };
    loadSavedEmail();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleAuth = async () => {
    const cleanEmail = email.trim().toLowerCase();
    
    if (!cleanEmail || !password) {
      Alert.alert('Error', 'Please fill in all fields with a valid email.');
      return;
    }
    setLoading(true);
    try {
      if (activeTab === 'login') {
        await signIn(cleanEmail, password);
        
        if (rememberMe) {
          await AsyncStorage.setItem('saved_email', cleanEmail);
        } else {
          await AsyncStorage.removeItem('saved_email');
        }
      } else {
        if (!name || !province || !city) {
          Alert.alert('Error', 'Please provide your name, province, and city.');
          setLoading(false);
          return;
        }
        await signUp(name, cleanEmail, password, 'user', {
          country: 'Philippines',
          province,
          city,
          barangay
        });
      }
    } catch (error: any) {
      Alert.alert('Auth Error', error.message || 'An error occurred');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Header Hero */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&fit=crop' }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(155,63,0,0.4)', COLORS.surface]}
            style={styles.heroOverlay}
          />
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>WELCOME TO</Text>
            <Text style={styles.heroTitle}>Fetch Me Up</Text>
            <Text style={styles.heroSub}>Your premium kinetic experience begins here.</Text>
          </View>
        </View>

        {/* Auth Form Container */}
        <Animated.View style={[styles.formWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'login' && styles.activeTab]}
              onPress={() => setActiveTab('login')}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
              onPress={() => setActiveTab('signup')}
            >
              <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fields}>
            {activeTab === 'signup' && (
              <Input
                label="FULL NAME"
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
                variant="filled"
                icon={<Ionicons name="person-outline" size={18} color={COLORS.primary} />}
              />
            )}

            <Input
              label="EMAIL ADDRESS"
              placeholder="alex@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              variant="filled"
              icon={<Ionicons name="mail-outline" size={18} color={COLORS.primary} />}
            />

            <View>
              {activeTab === 'login' && (
                <View style={styles.passwordHeader}>
                  <Text style={styles.fieldLabel}>PASSWORD</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('GenericContent', { title: 'Forgot Password' })}>
                    <Text style={styles.forgotText}>Forgot?</Text>
                  </TouchableOpacity>
                </View>
              )}
              <Input
                label={activeTab === 'signup' ? 'PASSWORD' : undefined}
                placeholder="••••••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                variant="filled"
                icon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.primary} />}
              />
              
              {activeTab === 'login' && (
                <View style={styles.rememberRow}>
                  <TouchableOpacity 
                    style={styles.checkboxWrapper}
                    activeOpacity={0.7}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                      {rememberMe && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
                    </View>
                    <Text style={styles.rememberText}>Keep me signed in</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {activeTab === 'signup' && (
              <View style={styles.locationSection}>
                <Text style={styles.sectionDivider}>PRIMARY LOCATION</Text>
                <View style={styles.locGrid}>
                   <Input
                    label="PROVINCE"
                    placeholder="Agusan del Norte"
                    value={province}
                    onChangeText={setProvince}
                    variant="filled"
                  />
                  <Input
                    label="CITY"
                    placeholder="Butuan City"
                    value={city}
                    onChangeText={setCity}
                    variant="filled"
                  />
                </View>
                <Input
                  label="BARANGAY (OPTIONAL)"
                  placeholder="e.g. Libertad"
                  value={barangay}
                  onChangeText={setBarangay}
                  variant="filled"
                />
              </View>
            )}

            <View style={{ marginTop: 20 }}>
              <Button
                title={activeTab === 'login' ? 'Proceed to Dashboard' : 'Finalize Registration'}
                onPress={handleAuth}
                size="xl"
                fullWidth
                loading={loading}
                icon={<Ionicons name="chevron-forward" size={20} color={COLORS.white} />}
              />
            </View>
          </View>

          {/* Social Auth */}
          <View style={styles.socialContainer}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>SECURE CONNECT</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-google" size={20} color={COLORS.onSurface} />
                <Text style={styles.socialBtnText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-apple" size={20} color={COLORS.onSurface} />
                <Text style={styles.socialBtnText}>Apple ID</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.legalText}>
            By continuing, you agree to our <Text style={styles.legalLink}>Terms of Service</Text> and <Text style={styles.legalLink}>Privacy Policy</Text>.
          </Text>
        </Animated.View>
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
    flexGrow: 1,
  },
  heroSection: {
    height: 340,
    width: '100%',
    justifyContent: 'flex-end',
    paddingBottom: 60,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroContent: {
    paddingHorizontal: 24,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 4,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -1,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    maxWidth: '80%',
  },
  formWrapper: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -40,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    ...SHADOWS.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: RADIUS.full,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: `${COLORS.onSurface}60`,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  fields: {
    gap: 20,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.onSurfaceVariant,
  },
  forgotText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  rememberRow: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: `${COLORS.primary}30`,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  locationSection: {
    marginTop: 10,
    gap: 16,
  },
  sectionDivider: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    color: COLORS.primary,
    marginBottom: 4,
  },
  locGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  socialContainer: {
    marginTop: 40,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: `${COLORS.outlineVariant}30`,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    color: `${COLORS.onSurfaceVariant}40`,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}30`,
    ...SHADOWS.sm,
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  legalText: {
    marginTop: 32,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  legalLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
