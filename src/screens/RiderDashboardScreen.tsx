import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  Alert,
  Modal,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { subscribeToAvailableJobs, subscribeToRiderJobs, Order, acceptOrder, updateOrderStatus } from '../services/orderService';
import { startRiderLocationTracking, stopRiderLocationTracking } from '../services/locationService';

const { width } = Dimensions.get('window');

export default function RiderDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Order[]>([]);
  const [activeJob, setActiveJob] = useState<Order | null>(null);
  const [myCompletedJobs, setMyCompletedJobs] = useState<Order[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [showQR, setShowQR] = useState(false);

  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const toggleAnim = useRef(new Animated.Value(isOnline ? 1 : 0)).current;

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToRiderJobs(user.uid, (data) => {
      setMyCompletedJobs(data.filter(j => j.status === 'completed'));
      
      const active = data.find(j => j.status === 'accepted' || j.status === 'picked_up');
      setActiveJob(active || null);
      
      if (active) {
        startRiderLocationTracking(active.id!);
      } else {
        stopRiderLocationTracking();
      }
    });
    
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 7, useNativeDriver: true }),
    ]).start();

    return () => {
      unsub();
      stopRiderLocationTracking();
    };
  }, [user]);

  useEffect(() => {
    const unsubscribe = subscribeToAvailableJobs((liveJobs) => {
      setJobs(liveJobs);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleStatus = () => {
    const nextValue = !isOnline;
    setIsOnline(nextValue);
    Animated.spring(toggleAnim, {
      toValue: nextValue ? 1 : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  };

  const handleAcceptJob = async (orderId: string) => {
    if (!user || activeJob) {
      Alert.alert("Mission Overload", "Complete your current mission before taking a new one.");
      return;
    }
    try {
      const success = await acceptOrder(orderId, user.uid);
      if (success) {
        Alert.alert("Assignment Confirmed", "Mission started. GPS Pulse active.", [
          { text: "View Details", onPress: () => navigation.navigate('TrackingDetail', { orderId }) }
        ]);
      } else {
        Alert.alert("Too Late", "Someone else took this job.");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleUpdateStatus = async (status: 'picked_up' | 'completed') => {
    if (!activeJob?.id) return;
    try {
      await updateOrderStatus(activeJob.id, status);
      if (status === 'completed') {
        Alert.alert("Mission Success", "Reward added to your earnings.");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const todayRevenue = (() => {
    const today = new Date();
    return myCompletedJobs.filter(j => {
      if (!j.createdAt) return false;
      let d: Date;
      if (typeof j.createdAt === 'string') {
        d = new Date(j.createdAt);
      } else if (j.createdAt && j.createdAt.seconds) {
        d = new Date(j.createdAt.seconds * 1000);
      } else {
        return false; // Skip if timestamp is still resolving
      }
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
    }).reduce((sum, j) => sum + (j.price || 0), 0);
  })();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Dynamic Header */}
      <LinearGradient
        colors={[COLORS.onSurface, '#0f1419']}
        style={styles.headerHero}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile')}
          >
             <View style={styles.avatar}>
               {user?.photoURL ? (
                 <Image source={{ uri: user.photoURL }} style={styles.avatarImg} />
               ) : (
                 <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'R'}</Text>
               )}
             </View>
             <View>
               <Text style={styles.riderName}>{user?.name || 'Professional Rider'}</Text>
               <Text style={styles.riderRating}>⭐ 4.9 Premium Fleet</Text>
             </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notiBtn} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
            <View style={styles.notiBadge} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerBottom}>
          <View>
            <Text style={styles.welcomeTxt}>Ready for your next mission?</Text>
            <Text style={styles.statusTxt}>{isOnline ? '● You are currently ONLINE' : '○ System OFFLINE'}</Text>
          </View>
          
          <TouchableOpacity 
            activeOpacity={0.9}
            style={[styles.mainToggle, !isOnline && styles.mainToggleOff]}
            onPress={handleToggleStatus}
          >
            <Animated.View style={[
              styles.toggleThumb,
              { 
                marginLeft: toggleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [4, 30]
                })
              }
            ]} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Active Mission Card */}
          {activeJob && (
            <View style={styles.activeJobContainer}>
               <LinearGradient colors={[COLORS.primary, '#E65100']} style={styles.activeJobCard}>
                  <View style={styles.activeHeader}>
                    <View style={styles.liveBadge}>
                       <View style={styles.pulseDot} />
                       <Text style={styles.liveBadgeText}>LIVE MISSION</Text>
                    </View>
                    <Text style={styles.activePrice}>₱{activeJob.price?.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.activeDetails}>
                     <Text style={styles.activeRouteLabel}>CURRENT DESTINATION</Text>
                     <Text style={styles.activeRouteText} numberOfLines={1}>
                        {activeJob.status === 'accepted' ? activeJob.pickupLocation : activeJob.dropoffLocation}
                     </Text>
                  </View>

                  <View style={styles.activeActions}>
                     <TouchableOpacity 
                        style={styles.activeMainBtn}
                        onPress={() => handleUpdateStatus(activeJob.status === 'accepted' ? 'picked_up' : 'completed')}
                     >
                        <Text 
                          style={styles.activeMainBtnText}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                        >
                           {activeJob.status === 'accepted' ? 'CONFIRM PICKUP' : 'COMPLETE DELIVERY'}
                        </Text>
                     </TouchableOpacity>
                     
                     <TouchableOpacity 
                        style={styles.qrBtn}
                        onPress={() => setShowQR(true)}
                     >
                        <Ionicons name="qr-code" size={20} color={COLORS.white} />
                     </TouchableOpacity>

                     <TouchableOpacity 
                        style={styles.activeSideBtn}
                        onPress={() => navigation.navigate('TrackingDetail', { orderId: activeJob.id })}
                     >
                        <Ionicons name="map-outline" size={20} color={COLORS.white} />
                     </TouchableOpacity>
                  </View>
               </LinearGradient>
            </View>
          )}

          {/* Payment QR Modal */}
          <Modal visible={showQR} transparent animationType="fade">
            <View style={styles.qrOverlay}>
               <View style={styles.qrPanel}>
                 <Text style={styles.qrTitle}>MISSION PAYMENT QR</Text>
                 <Text style={styles.qrSub}>Scan this to pay ₱{activeJob?.price?.toFixed(2)}</Text>
                 
                 <View style={styles.qrBox}>
                   {/* Simulated Premium QR */}
                   <View style={styles.qrInner}>
                     <Ionicons name="qr-code" size={180} color="#0f1419" />
                     <View style={styles.qrCenterLogo}>
                       <Text style={styles.qrFetchText}>F</Text>
                     </View>
                   </View>
                   {/* Hidden machine readable text for scanning simulation */}
                   <Text style={{opacity: 0, height: 0}}>
                     {`FETCHPAY:${activeJob?.id}:${activeJob?.price}:${user?.uid}:${user?.name}`}
                   </Text>
                 </View>

                 <View style={styles.qrDetails}>
                   <View style={styles.qrDetailItem}>
                     <Text style={styles.qrLabel}>ORDER ID</Text>
                     <Text style={styles.qrValue}>#{activeJob?.id?.substring(0,8).toUpperCase()}</Text>
                   </View>
                   <View style={[styles.qrDetailItem, { alignItems: 'flex-end' }]}>
                     <Text style={styles.qrLabel}>RIDER</Text>
                     <Text style={styles.qrValue}>{user?.name}</Text>
                   </View>
                 </View>

                 <TouchableOpacity style={styles.qrCloseBtn} onPress={() => setShowQR(false)}>
                    <Text style={styles.qrCloseText}>CLOSE QR CODE</Text>
                 </TouchableOpacity>
               </View>
            </View>
          </Modal>

          {/* Quick Stats Widgets */}
          <View style={styles.statsContainer}>
            <TouchableOpacity 
              style={styles.revCard}
              onPress={() => navigation.navigate('Earnings')}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'transparent']}
                style={styles.innerCard}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View>
                    <Text style={styles.revLabel}>TOTAL REVENUE TODAY</Text>
                    <Text style={styles.revValue}>₱{todayRevenue.toFixed(2)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(0,0,0,0.1)" />
                </View>
                <View style={styles.revTrend}>
                  <Ionicons name="trending-up" size={12} color={COLORS.tertiary} />
                  <Text style={styles.revTrendText}>Live Session Tracking</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.smallStatsRow}>
              <View style={styles.smallStatCard}>
                <Text style={styles.smallStatValue}>{myCompletedJobs.length}</Text>
                <Text style={styles.smallStatLabel}>Finished</Text>
              </View>
              <View style={styles.smallStatCard}>
                <Text style={styles.smallStatValue}>98%</Text>
                <Text style={styles.smallStatLabel}>Acceptance</Text>
              </View>
            </View>
          </View>

          {/* Active Job Pool */}
          <View style={styles.poolHeader}>
            <View>
              <Text style={styles.poolTitle}>MISSION POOL</Text>
              <Text style={styles.poolSub}>Available high-priority requests near you</Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn}>
              <Ionicons name="refresh" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {jobs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyCircle}>
                <Ionicons name="scan-outline" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>Scanning Butuan City...</Text>
              <Text style={styles.emptySub}>Sit tight. High-value orders usually appear in batches.</Text>
            </View>
          ) : (
            <View style={styles.jobList}>
              {jobs.map((job) => (
                <View key={job.id} style={styles.missionCard}>
                   <View style={styles.missionHeader}>
                      <View style={styles.typeTag}>
                        <Ionicons 
                         name={job.type === 'food' ? 'restaurant' : job.type === 'parcel' ? 'cube' : 'car'} 
                         size={14} color={COLORS.white} 
                        />
                        <Text style={styles.typeTagName}>{(job.type || 'Mission').toUpperCase()}</Text>
                      </View>
                      <Text style={styles.missionPrice}>₱{job.price?.toFixed(2)}</Text>
                   </View>

                   <View style={styles.missionBody}>
                      <View style={styles.routeContainer}>
                        <View style={styles.routeIcons}>
                          <View style={styles.dot} />
                          <View style={styles.line} />
                          <Ionicons name="location" size={16} color={COLORS.primary} />
                        </View>
                        <View style={styles.routeInfo}>
                          <Text style={styles.routeLabel}>PICKUP</Text>
                          <Text style={styles.routeText} numberOfLines={1}>{job.pickupLocation}</Text>
                          <View style={{ height: 16 }} />
                          <Text style={styles.routeLabel}>DROPOFF</Text>
                          <Text style={styles.routeText} numberOfLines={1}>{job.dropoffLocation}</Text>
                        </View>
                      </View>

                      {job.itemDetails && (
                        <View style={styles.detailsBox}>
                          <Text style={styles.detailsText} numberOfLines={2}>"{job.itemDetails}"</Text>
                        </View>
                      )}

                      <View style={styles.missionActions}>
                        <View style={styles.distanceInfo}>
                          <Ionicons name="navigate-outline" size={14} color={COLORS.onSurfaceVariant} />
                          <Text style={styles.distanceText}>Est. 2.4 km away</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.acceptBtn}
                          onPress={() => handleAcceptJob(job.id!)}
                        >
                          <Text style={styles.acceptBtnText}>ACCEPT MISSION</Text>
                        </TouchableOpacity>
                      </View>
                   </View>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Control Strip */}
      <View style={styles.controlStrip}>
        <TouchableOpacity 
          style={styles.controlBtn} 
          onPress={() => navigation.navigate('RiderSettings', { section: 'payout' })}
        >
          <Ionicons name="wallet-outline" size={24} color={COLORS.white} />
          <Text style={styles.controlText}>Payouts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.mapCenterBtn} 
          onPress={() => navigation.navigate('Jobs')}
        >
          <Ionicons name="map" size={30} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.controlBtn}
          onPress={() => navigation.navigate('RiderSettings', { section: 'personal' })}
        >
          <Ionicons name="settings-outline" size={24} color={COLORS.white} />
          <Text style={styles.controlText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerHero: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...SHADOWS.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.primary}CC`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  riderName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  riderRating: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    marginTop: 2,
  },
  notiBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notiBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1.5,
    borderColor: '#0f1419',
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  welcomeTxt: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.2,
  },
  statusTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryLight,
    marginTop: 4,
    letterSpacing: 1,
  },
  mainToggle: {
    width: 60,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  mainToggleOff: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 140,
  },
  statsContainer: {
    marginBottom: 32,
  },
  revCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.md,
    marginBottom: 16,
  },
  innerCard: {
    padding: 24,
  },
  revLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: COLORS.onSurfaceVariant,
    marginBottom: 8,
  },
  revValue: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -1,
  },
  revTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  revTrendText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.tertiary,
  },
  smallStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallStatCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    ...SHADOWS.sm,
    alignItems: 'center',
  },
  smallStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  smallStatLabel: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
    marginTop: 2,
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  poolTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: COLORS.onSurface,
  },
  poolSub: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0f1419',
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  typeTagName: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
  },
  missionPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primaryLight,
  },
  missionBody: {
    padding: 20,
  },
  routeContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  routeIcons: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 4,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.onSurfaceVariant,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  routeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  detailsBox: {
    marginTop: 20,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  detailsText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  missionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  acceptBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    ...SHADOWS.sm,
  },
  acceptBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  controlStrip: {
    position: 'absolute',
    bottom: 100, // Adjusted to avoid collision with Bottom Tab Bar
    left: 20,
    right: 20,
    height: 80,
    backgroundColor: '#0f1419',
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    ...SHADOWS.lg,
  },
  controlBtn: {
    alignItems: 'center',
    gap: 4,
  },
  controlText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
  },
  mapCenterBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    marginTop: -40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#F8F9FA',
    ...SHADOWS.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 20,
  },
  activeJobContainer: {
    marginBottom: 32,
    marginTop: -20,
  },
  activeJobCard: {
    borderRadius: 28,
    padding: 24,
    ...SHADOWS.lg,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1.5,
  },
  activePrice: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
  },
  activeDetails: {
    marginBottom: 24,
  },
  activeRouteLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  activeRouteText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
  },
  activeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  activeMainBtn: {
    flex: 3,

    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 18,
    ...SHADOWS.sm,
  },
  activeMainBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  qrBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSideBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  qrPanel: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 36,
    padding: 32,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: 'rgba(0,0,0,0.3)',
    marginBottom: 8,
  },
  qrSub: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.onSurface,
    marginBottom: 32,
    textAlign: 'center',
  },
  qrBox: {
    width: 240,
    height: 240,
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F3F5',
    marginBottom: 32,
  },
  qrInner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCenterLogo: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  qrFetchText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
  },
  qrDetails: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
    marginBottom: 32,
  },
  qrDetailItem: {
    gap: 4,
  },
  qrLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.3)',
    letterSpacing: 1,
  },
  qrValue: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  qrCloseBtn: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: '#f1f3f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCloseText: {
    fontSize: 13,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.5)',
    letterSpacing: 1,
  },
});

