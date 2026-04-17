import React, { useRef, useEffect } from 'react';
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

const { width } = Dimensions.get('window');

export default function UserProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.log('Error logging out: ', error);
    }
  };

  const menuSections = [
    {
      title: 'FINANCIAL & LOGS',
      items: [
        { icon: 'time-outline', label: 'Order History', screen: 'Activity' },
        { icon: 'wallet-outline', label: 'Payment Methods', sub: 'Visa •••• 4412' },
        { icon: 'ticket-outline', label: 'Vouchers & Promos', badge: '3 NEW' },
      ]
    },
    {
      title: 'PERSONALIZATION',
      items: [
        { icon: 'person-outline', label: 'Identity Profile', sub: user?.name, screen: 'ProfileEdit' },
        { icon: 'location-outline', label: 'Default Mission Zone', sub: user?.location?.barangay || 'Set home area', screen: 'ProfileEdit' },
        { icon: 'notifications-outline', label: 'App Preferences', screen: 'ProfileEdit' },
      ]
    },
    {
      title: 'PREFERENCES',
      items: [
        { icon: 'shield-checkmark-outline', label: 'Privacy & Security', screen: 'PrivacySecurity' },
        { icon: 'help-circle-outline', label: 'Help & Support', screen: 'HelpSupport' },
      ]
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* Profile Hero Section */}
        <View style={styles.heroSection}>
           <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&fit=crop' }} 
            style={styles.heroBg} 
           />
           <LinearGradient
            colors={['transparent', 'rgba(15,20,25,0.7)', '#0f1419']}
            style={styles.heroOverlay}
           />
           
           <View style={styles.heroContent}>
              <View style={styles.avatarContainer}>
                 <View style={styles.avatar}>
                    {user?.photoURL ? (
                      <Image source={{ uri: user.photoURL }} style={styles.avatarImg} />
                    ) : (
                      <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                    )}
                 </View>
                 <View style={styles.identityBadge}>
                    <Ionicons name="checkmark-seal" size={16} color={COLORS.white} />
                 </View>
              </View>

              <Text style={styles.userName}>{user?.name || 'Fetch User'}</Text>
              <View style={styles.tierBadge}>
                 <Ionicons name="star" size={10} color={COLORS.primaryLight} />
                 <Text style={styles.tierText}>PLATINUM MEMBER</Text>
              </View>
           </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginTop: -32 }}>
           {/* Wallet Widget */}
           <View style={styles.walletWidget}>
              <View style={styles.walletInfo}>
                 <Text style={styles.walletLabel}>FETCH COINS</Text>
                 <Text style={styles.walletValue}>2,480.00</Text>
              </View>
              <View style={styles.walletDivider} />
              <TouchableOpacity style={styles.topUpBtn}>
                 <Text style={styles.topUpText}>TOP UP</Text>
              </TouchableOpacity>
           </View>

           <View style={styles.mainMenu}>
              {menuSections.map((section, sidx) => (
                 <View key={sidx} style={styles.sectionGroup}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <View style={styles.cardGroup}>
                       {section.items.map((item, iidx) => (
                          <TouchableOpacity 
                            key={iidx} 
                            style={[styles.menuItem, iidx === section.items.length - 1 && styles.lastItem]}
                            onPress={() => item.screen ? navigation.navigate(item.screen) : navigation.navigate('GenericContent', { title: item.label })}
                          >
                             <View style={styles.iconBox}>
                                <Ionicons name={item.icon as any} size={20} color={COLORS.onSurface} />
                             </View>
                             <View style={{ flex: 1 }}>
                                <Text style={styles.itemLabel}>{item.label}</Text>
                                {item.sub && <Text style={styles.itemSub}>{item.sub}</Text>}
                             </View>
                             {item.badge ? (
                                <View style={styles.itemBadge}><Text style={styles.itemBadgeText}>{item.badge}</Text></View>
                             ) : (
                                <Ionicons name="chevron-forward" size={16} color="rgba(0,0,0,0.15)" />
                             )}
                          </TouchableOpacity>
                       ))}
                    </View>
                 </View>
              ))}

              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                 <Text style={styles.logoutText}>SECURE LOGOUT</Text>
                 <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
              </TouchableOpacity>

              <Text style={styles.versionText}>FETCHMEUP V 4.2.0 • BUILT FOR BUTUAN</Text>
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
    height: 300,
    width: '100%',
    justifyContent: 'flex-end',
    paddingBottom: 48,
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
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
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  identityBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
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
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.primaryLight,
    letterSpacing: 1.5,
  },
  walletWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.md,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.3)',
    letterSpacing: 1,
  },
  walletValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.onSurface,
    marginTop: 2,
  },
  walletDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F1F3F5',
    marginHorizontal: 20,
  },
  topUpBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  topUpText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
  mainMenu: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 60,
  },
  sectionGroup: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: 'rgba(0,0,0,0.3)',
    marginBottom: 16,
    paddingLeft: 4,
  },
  cardGroup: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
    gap: 16,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  itemSub: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 2,
    fontWeight: '500',
  },
  itemBadge: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.primary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 24,
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
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.15)',
    letterSpacing: 1,
  },
});
