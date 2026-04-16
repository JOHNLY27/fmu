import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { subscribeToRiderJobs, updateOrderStatus, Order } from '../services/orderService';
import Button from '../components/ui/Button';

const { width } = Dimensions.get('window');

export default function RiderJobsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToRiderJobs(user.uid, (data) => {
      setJobs(data);
    });
    
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    return () => unsubscribe();
  }, [user]);

  const activeJobs = jobs.filter(j => ['accepted', 'picked_up'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const displayedJobs = activeTab === 'active' ? activeJobs : completedJobs;

  const handleUpdateStatus = (job: Order) => {
    let nextStatus: 'picked_up' | 'completed' = 'picked_up';
    let prompt = "Have you picked up the items and are heading to the customer?";
    if (job.status === 'picked_up') {
      nextStatus = 'completed';
      prompt = "Have you successfully delivered the items to the customer?";
    }

    Alert.alert(
      "Update Assignment Status",
      prompt,
      [
        { text: "Not Yet", style: "cancel" },
        { 
          text: "Confirm Status Update", 
          onPress: async () => {
            try {
              await updateOrderStatus(job.id!, nextStatus);
            } catch (e) {
              Alert.alert("Error", "Could not synchronize with cloud.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor={COLORS.surface} />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>ASSIGNMENT TRACKER</Text>
          <Text style={styles.headerTitle}>My Missions</Text>
        </View>
        <TouchableOpacity style={styles.historyBtn} onPress={() => setActiveTab(activeTab === 'active' ? 'completed' : 'active')}>
          <Ionicons 
            name={activeTab === 'active' ? "time-outline" : "flash-outline"} 
            size={22} 
            color={COLORS.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Pill Tabs */}
      <View style={styles.tabWrapper}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            In Progress ({activeJobs.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {displayedJobs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                 <Ionicons 
                  name={activeTab === 'active' ? "bicycle-outline" : "checkmark-done-circle-outline"} 
                  size={42} 
                  color={COLORS.primary} 
                />
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === 'active' ? "No Missions Assigned" : "History Empty"}
              </Text>
              <Text style={styles.emptySub}>
                {activeTab === 'active' 
                  ? "Return to the Dashboard to scout for available missions near your location." 
                  : "All your successfully delivered missions will be archived here."}
              </Text>
              {activeTab === 'active' && (
                <Button 
                  title="Check Mission Pool" 
                  onPress={() => navigation.navigate('Dashboard')} 
                  size="md"
                  style={{ marginTop: 24 }}
                  variant="primary"
                />
              )}
            </View>
          ) : (
            displayedJobs.map(job => (
              <View key={job.id} style={styles.missionCard}>
                {/* ID and Status Indicator */}
                <View style={styles.cardHeader}>
                  <View style={styles.idBadge}>
                    <Text style={styles.idText}>MISSION #{job.id?.substring(0, 8).toUpperCase()}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge, 
                    job.status === 'completed' ? styles.statusCompleted : styles.statusActive
                  ]}>
                    <View style={[
                      styles.statusDot, 
                      job.status === 'completed' ? { backgroundColor: COLORS.tertiary } : { backgroundColor: COLORS.primary }
                    ]} />
                    <Text style={[
                      styles.statusText,
                      job.status === 'completed' ? { color: COLORS.tertiary } : { color: COLORS.primary }
                    ]}>
                      {job.status?.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Vertical Route Logic */}
                <View style={styles.missionBody}>
                   <View style={styles.routeContainer}>
                      <View style={styles.routeLineBox}>
                        <View style={styles.routeStart} />
                        <View style={styles.routeLine} />
                        <Ionicons name="location" size={16} color={COLORS.primary} />
                      </View>
                      <View style={styles.routeInfo}>
                        <View>
                          <Text style={styles.routeLabel}>PICKUP FROM</Text>
                          <Text style={styles.routeText} numberOfLines={1}>{job.pickupLocation}</Text>
                        </View>
                        <View style={{ marginTop: 20 }}>
                          <Text style={styles.routeLabel}>DELIVER TO</Text>
                          <Text style={styles.routeText} numberOfLines={1}>{job.dropoffLocation}</Text>
                        </View>
                      </View>
                   </View>

                   {job.itemDetails && (
                      <View style={styles.detailsBox}>
                         <Ionicons name="information-circle-outline" size={14} color={COLORS.onSurfaceVariant} />
                         <Text style={styles.detailsText} numberOfLines={2}>"{job.itemDetails}"</Text>
                      </View>
                   )}

                   <View style={styles.divider} />

                   <View style={styles.cardFooter}>
                      <View>
                         <Text style={styles.footerLabel}>EXPECTED EARNINGS</Text>
                         <Text style={styles.footerPrice}>₱{job.price?.toFixed(2)}</Text>
                      </View>

                      {activeTab === 'active' && (
                        <View style={styles.actionGroup}>
                          <TouchableOpacity 
                            style={styles.chatBtn}
                            onPress={() => navigation.navigate('Chat', { orderId: job.id })}
                          >
                            <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.mapBtn}
                            onPress={() => navigation.navigate('TrackingDetail', { orderId: job.id })}
                          >
                             <Ionicons name="navigate-circle" size={24} color={COLORS.white} />
                          </TouchableOpacity>
                        </View>
                      )}
                   </View>

                   {activeTab === 'active' && (
                     <TouchableOpacity 
                       style={[
                         styles.mainStatusBtn,
                         job.status === 'picked_up' && styles.mainStatusBtnAlt
                       ]}
                       onPress={() => handleUpdateStatus(job)}
                     >
                        <Text style={styles.mainStatusText}>
                          {job.status === 'accepted' ? 'PICKED UP ORDER' : 'MARK AS DELIVERED'}
                        </Text>
                        <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
                     </TouchableOpacity>
                   )}
                </View>
              </View>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 24,
    backgroundColor: COLORS.white,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.primary,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -1,
  },
  historyBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  tabWrapper: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: '#E9ECEF',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.4)',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconCircle: {
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
    maxWidth: '85%',
    lineHeight: 20,
    fontWeight: '500',
  },
  missionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  idBadge: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  idText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: `${COLORS.primary}10`,
  },
  statusCompleted: {
    backgroundColor: `${COLORS.tertiary}10`,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  missionBody: {
    padding: 20,
  },
  routeContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  routeLineBox: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  routeStart: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  routeLine: {
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
    letterSpacing: 1,
    marginBottom: 4,
  },
  routeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  detailsBox: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
    lineHeight: 18,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginVertical: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  footerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1,
    marginBottom: 4,
  },
  footerPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chatBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.onSurface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  mainStatusBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 16,
    ...SHADOWS.md,
  },
  mainStatusBtnAlt: {
    backgroundColor: COLORS.tertiary,
  },
  mainStatusText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
});
