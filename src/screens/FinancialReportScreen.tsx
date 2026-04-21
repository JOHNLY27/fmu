import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { subscribeToTransactions, Transaction } from '../services/walletService';
import { subscribeToRiderJobs, Order } from '../services/orderService';

const { width } = Dimensions.get('window');

export default function FinancialReportScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'transactions' | 'analytics'>('transactions');

  useEffect(() => {
    if (!user?.uid) return;

    const unsubTx = subscribeToTransactions(user.uid, (data) => setTransactions(data));
    const unsubJobs = subscribeToRiderJobs(user.uid, (data) => setOrders(data.filter(o => o.status === 'completed')));

    return () => {
      unsubTx();
      unsubJobs();
    };
  }, [user]);

  // Analytics Logic
  const totalDigital = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalCash = orders.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + o.price, 0);
  const totalRev = totalDigital + totalCash;

  const renderTxItem = (tx: Transaction) => (
    <View style={styles.txItem} key={tx.id}>
      <View style={[styles.iconBox, { backgroundColor: tx.type === 'credit' ? '#ECFDF5' : '#FEF2F2' }]}>
        <Ionicons 
          name={tx.type === 'credit' ? "arrow-down-outline" : "arrow-up-outline"} 
          size={18} 
          color={tx.type === 'credit' ? '#059669' : '#DC2626'} 
        />
      </View>
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={styles.txTitle}>{tx.description}</Text>
        <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
      <Text style={[styles.txAmount, { color: tx.type === 'credit' ? '#059669' : '#DC2626' }]}>
        {tx.type === 'credit' ? '+' : '-'}₱{tx.amount.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Financial Intelligence</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>HISTORY</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>ANALYTICS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {activeTab === 'transactions' ? (
          <View>
            <Text style={styles.sectionTitle}>LEDGER LOGS</Text>
            {transactions.map(renderTxItem)}
            {transactions.length === 0 && (
                <Text style={styles.emptyText}>No transaction records found.</Text>
            )}
          </View>
        ) : (
          <View>
             <View style={styles.statCard}>
                <Text style={styles.statLabel}>LIFETIME REVENUE</Text>
                <Text style={styles.statValue}>₱{totalRev.toFixed(0)}</Text>
                
                <View style={styles.divider} />
                
                <View style={styles.statRow}>
                   <View>
                      <Text style={styles.statSubLabel}>DIGITAL WALLET</Text>
                      <Text style={styles.statSubValue}>₱{totalDigital.toFixed(2)}</Text>
                   </View>
                   <View>
                      <Text style={[styles.statSubLabel, { textAlign: 'right' }]}>CASH COLLECTED</Text>
                      <Text style={[styles.statSubValue, { textAlign: 'right' }]}>₱{totalCash.toFixed(2)}</Text>
                   </View>
                </View>
             </View>

             <Text style={styles.sectionTitle}>MISSION VOLUME</Text>
             <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                   <Text style={styles.infoLabel}>Completed Missions</Text>
                   <Text style={styles.infoValue}>{orders.length}</Text>
                </View>
                <View style={styles.infoRow}>
                   <Text style={styles.infoLabel}>Avg. Earning / Job</Text>
                   <Text style={styles.infoValue}>₱{orders.length ? (totalRev / orders.length).toFixed(2) : '0.00'}</Text>
                </View>
             </View>

             <View style={styles.noteBox}>
                <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.noteText}>
                   Digital earnings are withdrawable via Payout Request. Cash earnings are kept by you instantly upon mission completion.
                </Text>
             </View>
          </View>
        )}
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    gap: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  tab: {
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.3)',
    letterSpacing: 1,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: 'rgba(0,0,0,0.3)',
    marginBottom: 16,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    ...SHADOWS.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  txDate: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 2,
    fontWeight: '600',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '900',
  },
  statCard: {
    backgroundColor: COLORS.onSurface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    ...SHADOWS.md,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statSubLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 4,
  },
  statSubValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.sm,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.5)',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.primary}10`,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    lineHeight: 18,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 40,
    color: 'rgba(0,0,0,0.2)',
    fontWeight: '700',
  }
});
