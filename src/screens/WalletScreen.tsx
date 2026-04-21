import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
  Modal,
  Image,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { 
  subscribeToWallet, 
  subscribeToTransactions, 
  Transaction,
  topUpWallet 
} from '../services/walletService';

const { width } = Dimensions.get('window');

export default function WalletScreen({ navigation }: any) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);


  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleTopUp = () => {
    Alert.alert(
      "FetchPay Top-up",
      "Simulate a top-up of ₱100.00 to your wallet?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: async () => {
            if (user?.uid) {
              await topUpWallet(user.uid, 100);
              navigation.navigate('Receipt', {
                data: {
                  amount: 100,
                  target: 'Wallet Top-up',
                  type: 'Credit Deposit',
                  id: `TU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                }
              });
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (user?.uid) {
      const unsubWallet = subscribeToWallet(user.uid, (bal) => {
        setBalance(bal);
        setLoading(false);
      });

      const unsubTx = subscribeToTransactions(user.uid, (txs) => {
        setTransactions(txs);
      });

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      return () => {
        unsubWallet();
        unsubTx();
      };
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Premium Header */}
      <LinearGradient colors={[COLORS.onSurface, '#1a202c']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FetchPay Wallet</Text>
          <TouchableOpacity style={styles.backBtn}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
           <LinearGradient 
              colors={[COLORS.primary, '#E65100']} 
              style={styles.virtualCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
           >
              <View style={styles.cardHeader}>
                 <Text style={styles.cardLabel}>CURRENT BALANCE</Text>
                 <Ionicons name="wifi-outline" size={24} color="rgba(255,255,255,0.4)" style={{ transform: [{ rotate: '90deg' }] }} />
              </View>
              <Text style={styles.balanceText}>₱ {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
              <View style={styles.cardFooter}>
                 <View>
                    <Text style={styles.cardHolderLabel}>WALLET HOLDER</Text>
                    <Text style={styles.cardHolderName}>{user?.name?.toUpperCase() || 'FETCH USER'}</Text>
                 </View>
                 <View style={styles.cardChip} />
              </View>
           </LinearGradient>
        </View>
      </LinearGradient>

      {/* Action Grid - Horizontally Scrollable */}
      <View style={{ marginTop: -30 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionScrollContent}
        >
           <TouchableOpacity style={styles.actionItem} onPress={handleTopUp}>
              <View style={[styles.actionIconBox, { backgroundColor: '#E3F2FD' }]}>
                 <Ionicons name="add" size={24} color="#1E88E5" />
              </View>
              <Text style={styles.actionLabel}>Top Up</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('SendMoney')}>
              <View style={[styles.actionIconBox, { backgroundColor: '#F3E5F5' }]}>
                 <Ionicons name="send" size={20} color="#8E24AA" />
              </View>
              <Text style={styles.actionLabel}>Send</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.actionItem} onPress={() => setShowQR(true)}>
              <View style={[styles.actionIconBox, { backgroundColor: '#E1F5FE' }]}>
                 <Ionicons name="qr-code-outline" size={20} color="#0288D1" />
              </View>
              <Text style={styles.actionLabel}>My QR</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('ScanQR')}>
              <View style={[styles.actionIconBox, { backgroundColor: '#E8F5E9' }]}>
                 <Ionicons name="scan" size={20} color="#43A047" />
              </View>
              <Text style={styles.actionLabel}>Scan</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('BillsPayment')}>
              <View style={[styles.actionIconBox, { backgroundColor: '#FFF3E0' }]}>
                 <Ionicons name="receipt" size={20} color="#FB8C00" />
              </View>
              <Text style={styles.actionLabel}>Bills</Text>
           </TouchableOpacity>
        </ScrollView>
      </View>


      {/* Receiver QR Modal */}
      <Modal visible={showQR} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalDismiss} 
            activeOpacity={1} 
            onPress={() => setShowQR(false)} 
          />
          <View style={styles.qrContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.qrTitle}>MY FETCH ID</Text>
            <Text style={styles.qrSubText}>Let others scan this to send you credits</Text>
            
            <View style={styles.qrWrapper}>
               {/* Simulated QR UI */}
               <View style={styles.qrInternal}>
                  <Ionicons name="qr-code" size={200} color={COLORS.onSurface} />
                  <View style={styles.qrAvatarBox}>
                    {user?.photoURL ? (
                      <Image source={{ uri: user.photoURL }} style={styles.qrAvatar} />
                    ) : (
                      <Text style={styles.qrAvatarLetter}>{user?.name?.charAt(0).toUpperCase()}</Text>
                    )}
                  </View>
               </View>
               <Text style={{opacity: 0, height: 0}}>FETCHTRANSFER:{user?.email}</Text>
            </View>

            <View style={[styles.infoBox, { marginTop: 24, paddingVertical: 12 }]}>
               <Text style={styles.idLabel}>FETCHMEUP EMAIL</Text>
               <Text style={styles.idValue}>{user?.email}</Text>
            </View>

            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setShowQR(false)}
            >
               <Text style={styles.closeBtnText}>DONE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
         <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TRANSACTION HISTORY</Text>
            <TouchableOpacity>
               <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
         </View>

         {transactions.length === 0 ? (
           <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="rgba(0,0,0,0.1)" />
              <Text style={styles.emptyText}>Your digital trail starts here.</Text>
           </View>
         ) : (
           transactions.map((tx) => (
             <View key={tx.id} style={styles.txItem}>
                <View style={[styles.txIconBox, { backgroundColor: tx.type === 'credit' ? '#E8F5E9' : '#F1F3F5' }]}>
                   <Ionicons 
                      name={tx.type === 'credit' ? 'arrow-down' : 'cart-outline'} 
                      size={20} 
                      color={tx.type === 'credit' ? '#43A047' : COLORS.onSurface} 
                   />
                </View>
                <View style={{ flex: 1 }}>
                   <Text style={styles.txTitle}>{tx.description}</Text>
                   <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <Text style={[styles.txAmount, { color: tx.type === 'credit' ? '#43A047' : COLORS.onSurface }]}>
                   {tx.type === 'credit' ? '+' : '-'} ₱{tx.amount.toFixed(2)}
                </Text>
             </View>
           ))
         )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  backBtn: {
    padding: 8,
  },
  cardContainer: {
    paddingHorizontal: 24,
  },
  virtualCard: {
    height: 190,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    ...SHADOWS.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
  },
  balanceText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardHolderLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardHolderName: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actionScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 20, // Space for shadow
  },
  actionItem: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    width: 100, // Fixed width for scroll consistency
    ...SHADOWS.md,
  },

  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.3)',
    letterSpacing: 1.5,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 16,
  },
  txIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  txDate: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 2,
    fontWeight: '500',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '900',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.4)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  qrContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 32,
    alignItems: 'center',
    paddingBottom: 50,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    marginBottom: 24,
  },
  qrTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: 'rgba(0,0,0,0.3)',
    marginBottom: 8,
  },
  qrSubText: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.5)',
    fontWeight: '600',
    marginBottom: 32,
    textAlign: 'center',
  },
  qrWrapper: {
    backgroundColor: '#F8F9FA',
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  qrInternal: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrAvatarBox: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  qrAvatarLetter: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
  },
  idLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  idValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
  },
  closeBtn: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.onSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    ...SHADOWS.md,
  },
  closeBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});

