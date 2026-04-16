import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Button from '../components/ui/Button';

const { width } = Dimensions.get('window');
const HERO_IMAGE = 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=1200&fit=crop'; // Cinematic urban shot

export default function LandingScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(1.1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Background Image Wrapper */}
      <View style={styles.bgWrapper}>
        <Animated.Image
          source={{ uri: HERO_IMAGE }}
          style={[styles.bgImage, { transform: [{ scale: scaleAnim }] }]}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', COLORS.onSurface]}
          style={styles.gradientOverlay}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        <View style={styles.heroSection}>
          <Animated.View style={[styles.header, { opacity: logoOpacity }]}>
            <View style={styles.logoBadge}>
               <Text style={styles.logo}>FETCH <Text style={styles.logoHighlight}>ME UP</Text></Text>
            </View>
            <TouchableOpacity 
              style={styles.riderBtn}
              onPress={() => navigation.navigate('RiderPortal')}
            >
              <Text style={styles.riderBtnText}>BECOME A RIDER</Text>
              <Ionicons name="chevron-forward" size={12} color={COLORS.primary} />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.spacer} />

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.cityBadge}>
              <Ionicons name="location" size={14} color={COLORS.primary} />
              <Text style={styles.cityText}>TRUSTED IN BUTUAN CITY</Text>
            </View>
            
            <Text style={styles.heroTitle}>
              Urban Logistics.{'\n'}
              <Text style={styles.heroHighlightText}>Perfected.</Text>
            </Text>
            
            <Text style={styles.heroSubtitle}>
              Experience the kinetic speed of premium ride-hailing and curated local deliveries. Your city, fetched.
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>5m</Text>
                <Text style={styles.statLabel}>Avg. Pickup</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>24/7</Text>
                <Text style={styles.statLabel}>Service</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4.9</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        <Animated.View 
          style={[
            styles.actionCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.actionTitle}>Elevate your journey</Text>
          <Text style={styles.actionSub}>Join thousands of users moving smarter.</Text>

          <View style={styles.btnGroup}>
            <Button
              title="Get Started"
              onPress={() => navigation.navigate('Login')}
              size="xl"
              fullWidth
              variant="primary"
              icon={<Ionicons name="arrow-forward" size={20} color={COLORS.white} />}
            />
            
            <TouchableOpacity 
              style={styles.loginBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginBtnText}>I already have an account</Text>
              <Text style={styles.loginBtnLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Text style={styles.copyright}>
          VELOCITY LOGISTICS CORP • DATA PRIVACY PROTECTED
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.onSurface,
  },
  bgWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.onSurface,
  },
  bgImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  heroSection: {
    height: Dimensions.get('window').height * 0.75,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'space-between',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logo: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  logoHighlight: {
    color: COLORS.primary,
  },
  riderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    ...SHADOWS.sm,
  },
  riderBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  spacer: {
    flex: 1,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,122,44,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,122,44,0.3)',
  },
  cityText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -1.5,
    lineHeight: 52,
    marginBottom: 16,
  },
  heroHighlightText: {
    color: COLORS.primaryLight,
    fontStyle: 'italic',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: '90%',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 40,
  },
  statItem: {
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  actionCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.xl,
    padding: 32,
    borderRadius: RADIUS.xxl,
    marginTop: -20,
    ...SHADOWS.lg,
  },
  actionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSub: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 32,
  },
  btnGroup: {
    gap: 16,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  loginBtnText: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  loginBtnLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  copyright: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: 40,
    letterSpacing: 2,
  },
});
