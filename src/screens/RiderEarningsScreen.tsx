import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { subscribeToRiderJobs, Order } from '../services/orderService';
import Button from '../components/ui/Button';

const { width } = Dimensions.get('window');

export default function RiderEarningsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [completedJobs, setCompletedJobs] = useState<Order[]>([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToRiderJobs(user.uid, (data) => {
      setCompletedJobs(data.filter(j => j.status === 'completed'));
    });
    
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
    ]).start();

    return () => unsub();
  }, [user]);

  // Aggregate data for the financial dashboard
  const dailyRevenue: Record<string, number> = {};
  const weeklyBars = [
    { day: 'MON', amount: 0 },
    { day: 'TUE', amount: 0 },
    { day: 'WED', amount: 0 },
    { day: 'THU', amount: 0 },
    { day: 'FRI', amount: 0 },
    { day: 'SAT', amount: 0 },
    { day: 'SUN', amount: 0 },
  ];

  completedJobs.forEach(job => {
    if (job.createdAt) {
      const date = new Date(typeof job.createdAt === 'string' ? job.createdAt : (job.createdAt.seconds * 1000));
      
      const dayIndex = date.getDay(); // 0 is Sun
      const mapping = [6, 0, 1, 2, 3, 4, 5]; // Map Sun to end of array
      weeklyBars[mapping[dayIndex]].amount += (job.price || 0);

      const dateString = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dailyRevenue[dateString] = (dailyRevenue[dateString] || 0) + (job.price || 0);
    }
  });

  const totalBalance = completedJobs.reduce((sum, j) => sum + (j.price || 0), 0);
  const maxWeeklyAmount = Math.max(...weeklyBars.map(b => b.amount), 1);
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor={COLORS.white} />
      
      {/* Financial Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>FINANCIAL OVERVIEW</Text>
          <Text style={styles.headerTitle}>Earnings</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="options-outline" size={22} color={COLORS.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* Main Balance Card (Glassmorphic look) */}
          <LinearGradient
            colors={[COLORS.onSurface, '#1c242c']}
            style={styles.balanceCard}
          >
            <View style={styles.cardHeader}>
               <View>
                 <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
                 <Text style={styles.balanceValue}>₱{totalBalance.toFixed(2)}</Text>
               </View>
               <TouchableOpacity style={styles.eyeBtn}>
                 <Ionicons name="eye-outline" size={20} color="rgba(255,255,255,0.4)" />
               </TouchableOpacity>
            </View>

            <View style={styles.cardStats}>
               <View style={styles.cardStatItem}>
                  <Text style={styles.cardStatLabel}>WITHDRAWABLE</Text>
                  <Text style={styles.cardStatValue}>₱{(totalBalance * 0.9).toFixed(2)}</Text>
               </View>
               <View style={styles.cardStatDivider} />
               <View style={styles.cardStatItem}>
                  <Text style={styles.cardStatLabel}>IN ESCROW</Text>
                  <Text style={styles.cardStatValue}>₱{(totalBalance * 0.1).toFixed(2)}</Text>
               </View>
            </View>

            <TouchableOpacity style={styles.payoutBtn}>
               <Text style={styles.payoutBtnText}>REQUEST PAYOUT</Text>
               <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Weekly Pulse Chart */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>WEEKLY PULSE</Text>
            <TouchableOpacity><Text style={styles.seeMore}>View Full Report</Text></TouchableOpacity>
          </View>

          <View style={styles.chartContainer}>
            {weeklyBars.map((bar, i) => {
              const heightPercent = bar.amount / maxWeeklyAmount;
              const isToday = bar.day === new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
              
              return (
                <View key={i} style={styles.chartCol}>
                   <View style={styles.barTrack}>
                      <View style={[
                        styles.barFill, 
                        { height: `${Math.max(heightPercent * 100, 5)}%` },
                        isToday && styles.todayBar
                      ]} />
                   </View>
                   <Text style={[styles.barLabel, isToday && styles.todayLabel]}>{bar.day}</Text>
                </View>
              );
            })}
          </View>

          {/* Achievement Widgets */}
          <View style={styles.widgetsRow}>
             <View style={styles.widgetCard}>
                <View style={[styles.widgetIcon, { backgroundColor: `${COLORS.tertiary}10` }]}>
                   <Ionicons name="flash" size={18} color={COLORS.tertiary} />
                </View>
                <Text style={styles.widgetValue}>94%</Text>
                <Text style={styles.widgetLabel}>Efficiency</Text>
             </View>
             <View style={styles.widgetCard}>
                <View style={[styles.widgetIcon, { backgroundColor: `${COLORS.secondary}10` }]}>
                   <Ionicons name="star" size={18} color={COLORS.secondary} />
                </View>
                <Text style={styles.widgetValue}>4.92</Text>
                <Text style={styles.widgetLabel}>Avg Rating</Text>
             </View>
             <View style={styles.widgetCard}>
                <View style={[styles.widgetIcon, { backgroundColor: `${COLORS.primary}10` }]}>
                   <Ionicons name="calendar" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.widgetValue}>24</Text>
                <Text style={styles.widgetLabel}>Days Active</Text>
             </View>
          </View>

          {/* History Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TRANSACTION LOG</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GenericContent', { title: 'Full History' })}>
               <Text style={styles.seeMore}>See All</Text>
            </TouchableOpacity>
          </View>

          {Object.entries(dailyRevenue).length === 0 ? (
            <View style={styles.emptyContainer}>
               <Ionicons name="receipt-outline" size={40} color="rgba(0,0,0,0.1)" />
               <Text style={styles.emptyText}>No financial logs available yet.</Text>
            </View>
          ) : (
            Object.entries(dailyRevenue)
              .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
              .map(([date, amount], idx) => (
                <TouchableOpacity key={idx} style={styles.transactionItem}>
                   <View style={styles.transIcon}>
                      <Ionicons name="wallet-outline" size={20} color={COLORS.onSurface} />
                   </View>
                   <View style={styles.transInfo}>
                      <Text style={styles.transTitle}>{date === todayStr ? 'Today' : date}</Text>
                      <Text style={styles.transSub}>Daily settlement total</Text>
                   </View>
                   <View style={styles.transAmountBox}>
                      <Text style={styles.transAmount}>+₱{amount.toFixed(2)}</Text>
                      <View style={styles.statusPill}>
                         <Text style={styles.statusText}>SETTLED</Text>
                      </View>
                   </View>
                </TouchableOpacity>
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
    color: '#0f1419',
    marginBottom: 4,
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -1,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  balanceCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 32,
    ...SHADOWS.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -1,
  },
  eyeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
  },
  cardStatItem: {
    flex: 1,
  },
  cardStatLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 4,
  },
  cardStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  cardStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
  },
  payoutBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    ...SHADOWS.md,
  },
  payoutBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#0f1419',
  },
  seeMore: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    ...SHADOWS.sm,
  },
  chartCol: {
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  barTrack: {
    flex: 1,
    width: 8,
    backgroundColor: '#F1F3F5',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
  },
  todayBar: {
    backgroundColor: COLORS.primary,
  },
  barLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.25)',
  },
  todayLabel: {
    color: COLORS.primary,
  },
  widgetsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  widgetCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  widgetIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  widgetValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  widgetLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.4)',
    marginTop: 2,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginBottom: 12,
    gap: 16,
    ...SHADOWS.sm,
  },
  transIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  transInfo: {
    flex: 1,
  },
  transTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  transSub: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 2,
    fontWeight: '500',
  },
  transAmountBox: {
    alignItems: 'flex-end',
  },
  transAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
  },
  statusPill: {
    backgroundColor: `${COLORS.tertiary}10`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.tertiary,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.3)',
    fontWeight: '600',
  },
});
