import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Button from '../components/ui/Button';

const { width } = Dimensions.get('window');

export default function LandingScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>VELOCITY</Text>
        <TouchableOpacity onPress={() => navigation.navigate('RiderPortal')}>
          <Text style={styles.joinLink}>Join Us</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Badge */}
        <Animated.View style={[styles.badge, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.badgeText}>START YOUR ENGINE</Text>
        </Animated.View>

        {/* Hero Title */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.heroTitle}>
            Join the{' '}
            <Text style={styles.heroHighlight}>Fetch Me Up</Text>
            {' '}movement.
          </Text>
        </Animated.View>

        {/* Hero Subtitle */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.heroSubtitle}>
            Experience logistics redefined. From precision ride-hailing to curated local deliveries, speed meets sophistication.
          </Text>
        </Animated.View>

        {/* Hero Image */}
        <Animated.View style={[styles.heroImageContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', `${COLORS.primary}66`]}
            style={styles.heroOverlay}
          />
          <View style={styles.heroCard}>
            <Text style={styles.heroCardLabel}>REAL-TIME SYNC</Text>
            <Text style={styles.heroCardText}>
              Curating the fastest routes through the city's heartbeat.
            </Text>
          </View>
        </Animated.View>

        {/* Sign-Up Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create Account</Text>
          <Text style={styles.formSubtitle}>Elevate your mobility today.</Text>

          <View style={styles.formFields}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>FULL NAME</Text>
              <TextInput
                style={styles.textInput}
                placeholder="John Doe"
                placeholderTextColor={`${COLORS.onSurfaceVariant}50`}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.textInput}
                placeholder="name@company.com"
                placeholderTextColor={`${COLORS.onSurfaceVariant}50`}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Button
              title="Sign Up"
              onPress={() => navigation.navigate('Home')}
              size="lg"
              fullWidth
              icon={<Ionicons name="arrow-forward" size={22} color={COLORS.white} />}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginLinkText}>Log In instead</Text>
              <View style={styles.loginLinkBar} />
            </TouchableOpacity>
          </View>

          <Text style={styles.termsText}>
            By proceeding, you agree to Velocity's Terms of Logistics & Data Curation Privacy Standards.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>VELOCITY LOGISTICS CORP © 2024</Text>
      </View>
    </View>
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
    letterSpacing: -1,
  },
  joinLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 80,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.secondaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.lg,
    marginTop: SPACING.lg,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -1,
    lineHeight: 42,
    marginBottom: SPACING.md,
  },
  heroHighlight: {
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
    lineHeight: 24,
    marginBottom: SPACING.xxl,
  },
  heroImageContainer: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.xxxl,
    ...SHADOWS.lg,
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  heroCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS.md,
    padding: 16,
    maxWidth: 200,
  },
  heroCardLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 3,
    color: COLORS.primary,
    marginBottom: 6,
  },
  heroCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurface,
    lineHeight: 17,
  },
  formContainer: {
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    ...SHADOWS.md,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xxl,
  },
  formFields: {
    gap: SPACING.lg,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.onSurfaceVariant,
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: COLORS.surfaceLow,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
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
    color: `${COLORS.onSurfaceVariant}50`,
  },
  loginLink: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  loginLinkBar: {
    width: 32,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },
  termsText: {
    fontSize: 9,
    color: `${COLORS.onSurfaceVariant}80`,
    textTransform: 'uppercase',
    letterSpacing: -0.3,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
  footer: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 3,
    color: `${COLORS.onSurface}30`,
    textTransform: 'uppercase',
  },
});
