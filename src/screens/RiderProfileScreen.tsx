import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { subscribeToRiderJobs } from '../services/orderService';

const { width } = Dimensions.get('window');

export default function RiderProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [completedCount, setCompletedCount] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToRiderJobs(user.uid, (data) => {
      setCompletedCount(data.filter(j => j.status === 'completed').length);
    });

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
    ]).start();

    return () => unsub();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
       console.log('Error logging out: ', error);
    }
  };

  const menuItems = [
    { title: 'Personal Information', icon: 'person-outline', sub: 'Name, phone and avatar', section: 'personal' },
    { title: 'Vehicle Management', icon: 'bicycle-outline', sub: 'Fleet data and registration', section: 'vehicle' },
    { title: 'Payout Settings', icon: 'wallet-outline', sub: 'Wallet (GCash/Maya) linkages', section: 'payout' },
    { title: 'Security & Access', icon: 'shield-checkmark-outline', sub: 'Password and re-auth', screen: 'ChangePassword' },
    { title: 'App Preferences', icon: 'settings-outline', sub: 'Device and system alerts', screen: 'PrivacySecurity' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* Profile Hero Header */}
        <View style={styles.heroSection}>
           <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800&fit=crop' }} 
            style={styles.coverImage} 
           />
           <LinearGradient
            colors={['transparent', 'rgba(15,20,25,0.8)', '#0f1419']}
            style={styles.coverOverlay}
           />
           
           <View style={styles.heroContent}>
              <View style={styles.avatarContainer}>
                 <View style={styles.avatar}>
                    {user?.photoURL ? (
                      <Image source={{ uri: user.photoURL }} style={styles.avatarImg} />
                    ) : (
                      <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'R'}</Text>
                    )}
                 </View>
                 <View style={styles.verifyBadge}>
                    <Ionicons name="shield-checkmark" size={14} color={COLORS.white} />
                 </View>
              </View>

              <Text style={styles.userName}>{user?.name || 'Professional Rider'}</Text>
              <View style={styles.idRow}>
                 <Text style={styles.userId}>UID: {user?.uid?.substring(0, 10).toUpperCase()}</Text>
                 <View style={styles.dot} />
                 <Text style={styles.userTier}>{completedCount >= 50 ? 'ELITE FLEET' : completedCount >= 20 ? 'MASTER RIDER' : 'ACTIVE AGENT'}</Text>
              </View>
           </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginTop: -32 }}>
           {/* Stats Ribbon */}
           <View style={styles.statsRibbon}>
              <View style={styles.statItem}>
                 <Text style={styles.statValue}>{completedCount}</Text>
                 <Text style={styles.statLabel}>MISSIONS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                 <Text style={styles.statValue}>4.9</Text>
                 <Text style={styles.statLabel}>RATING</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                 <Text style={styles.statValue}>{(() => {
                   const created = user?.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000) : new Date();
                   const diff = Math.max(1, Math.floor((new Date().getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
                   return `${diff}d`;
                 })()}</Text>
                 <Text style={styles.statLabel}>TENURE</Text>
              </View>
           </View>

           {/* Content Sections */}
           <View style={styles.mainContent}>
              
              <View style={styles.sectionHeader}>
                 <Text style={styles.sectionTitle}>OPERATIVE SETTINGS</Text>
              </View>

              <View style={styles.menuCard}>
                 {menuItems.map((item, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={[styles.menuItem, idx === menuItems.length - 1 && styles.lastMenuItem]}
                      onPress={() => item.screen ? navigation.navigate(item.screen) : navigation.navigate('RiderSettings', { section: item.section })}
                    >
                       <View style={styles.menuIconBox}>
                          <Ionicons name={item.icon as any} size={20} color={COLORS.onSurface} />
                       </View>
                       <View style={styles.menuTextInfo}>
                          <Text style={styles.menuItemTitle}>{item.title}</Text>
                          <Text style={styles.menuItemSub}>{item.sub}</Text>
                       </View>
                       <Ionicons name="chevron-forward" size={18} color="rgba(0,0,0,0.15)" />
                    </TouchableOpacity>
                 ))}
              </View>

              <View style={styles.sectionHeader}>
                 <Text style={styles.sectionTitle}>SERVICE COMPLIANCE</Text>
              </View>

               <TouchableOpacity style={styles.complianceCard} onPress={() => navigation.navigate('VerificationCenter')}>
                  <View style={styles.complianceHeader}>
                     <Ionicons name="document-lock-outline" size={24} color={COLORS.primary} />
                     <View>
                        <Text style={styles.complianceTitle}>Verification Center</Text>
                        <Text style={styles.complianceSub}>
                          {Object.keys(user?.requirements || {}).filter(k => k.endsWith('Status') && user?.requirements[k] === 'pending').length} pending reviews
                        </Text>
                     </View>
                  </View>
                  {(() => {
                    const approved = Object.keys(user?.requirements || {}).filter(k => k.endsWith('Status') && user?.requirements[k] === 'approved').length;
                    const strength = Math.round((approved / 3) * 100);
                    return (
                      <>
                        <View style={styles.progressTrack}>
                           <View style={[styles.progressFill, { width: `${strength || 5}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{strength}% Profile Strength</Text>
                      </>
                    );
                  })()}
               </TouchableOpacity>

              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                 <Text style={styles.logoutText}>TERMINATE SESSION</Text>
                 <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
              </TouchableOpacity>

              <Text style={styles.versionText}>V 4.2.0 (STABLE) • VELOCITY LOGISTICS</Text>
           </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F8F9FA',
  },
  heroSection: {
    height: 320,
    width: '100%',
    justifyContent: 'flex-end',
    paddingBottom: 48,
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    alignItems: 'center',
    gap: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.white,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  verifyBadge: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.tertiary,
    borderWidth: 3,
    borderColor: '#0f1419',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    opacity: 0.6,
  },
  userId: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.white,
  },
  userTier: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primaryLight,
    letterSpacing: 1,
  },
  statsRibbon: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.35)',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
    backgroundColor: '#F1F3F5',
  },
  mainContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 60,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    color: 'rgba(0,0,0,0.3)',
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    marginBottom: 32,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTextInfo: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  menuItemSub: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 2,
    fontWeight: '500',
  },
  complianceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 24,
    marginBottom: 32,
    ...SHADOWS.sm,
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  complianceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  complianceSub: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F1F3F5',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F1F3F5',
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.error,
    letterSpacing: 2,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.2)',
    letterSpacing: 1,
  },
});
