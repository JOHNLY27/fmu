import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Animated,

  Dimensions,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function VoucherScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'available' | 'used'>('available');
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Real-time listener for ACTIVE vouchers only
    const q = query(collection(db, 'vouchers'), where('isActive', '==', true));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVouchers(data);
      setLoading(false);
    });

    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    return () => unsub();
  }, []);


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voucher Wallet</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          
          <Text style={styles.heroTitle}>Your Exclusive Rewards</Text>
          <Text style={styles.heroSub}>Redeem these codes at checkout to save on your next mission.</Text>

          {/* Voucher List */}
          <View style={styles.voucherList}>
             {vouchers.length === 0 ? (
               <View style={{ padding: 40, alignItems: 'center' }}>
                  <Ionicons name="ticket-outline" size={48} color="rgba(0,0,0,0.1)" />
                  <Text style={{ marginTop: 12, color: 'rgba(0,0,0,0.3)', fontWeight: '700' }}>No active protocols detected.</Text>
               </View>
             ) : vouchers.map((v) => {
                const vColor = v.type === 'percent' ? '#7c3aed' : '#2563eb';
                return (
                <View key={v.id} style={styles.voucherCard}>
                   <View style={[styles.leftSection, { backgroundColor: vColor }]}>
                      <Text style={styles.valueText}>{v.type === 'percent' ? `${v.value}%` : `₱${v.value}`}</Text>
                      <Text style={styles.offText}>OFF</Text>
                   </View>
                   
                   <View style={styles.rightSection}>
                      <View style={styles.cardInfo}>
                         <Text style={styles.vTitle}>{v.title}</Text>
                         <Text style={styles.vDesc}>{v.desc || `Valid for orders over ₱${v.minSpend}`}</Text>
                         <View style={styles.expiryRow}>
                            <Ionicons name="time-outline" size={12} color="rgba(0,0,0,0.3)" />
                            <Text style={styles.expiryText}>Expires: {v.expiry || 'Protocol Active'}</Text>
                         </View>
                      </View>
                      
                      <View style={styles.dashLine} />
                      
                      <TouchableOpacity 
                        style={styles.copyBtn}
                        onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
                      >
                         <Text style={[styles.copyBtnText, { color: vColor }]}>USE CODE: {v.code}</Text>
                      </TouchableOpacity>

                   </View>

                   {/* Perforated Circles */}
                   <View style={styles.topCircle} />
                   <View style={styles.bottomCircle} />
                </View>
             )})}
          </View>


          {/* Promo Input */}
          <View style={styles.promoInputBox}>
             <Text style={styles.inputLabel}>GOT A PRIVATE CODE?</Text>
             <View style={styles.inputWrapper}>
                <Ionicons name="pricetag-outline" size={18} color="rgba(0,0,0,0.4)" style={{ marginLeft: 16 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="ENTER MISSION CODE"
                  placeholderTextColor="rgba(0,0,0,0.2)"
                  autoCapitalize="characters"
                  value={inputCode}
                  onChangeText={setInputCode}
                />
                <TouchableOpacity style={styles.applyBtn} onPress={() => {
                   if(inputCode) Alert.alert('Protocol Initiated', `Verifying mission code: ${inputCode.toUpperCase()}`);
                }}>
                   <Text style={styles.applyBtnText}>Claim</Text>
                </TouchableOpacity>
             </View>
          </View>


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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F8F9FA',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  scrollContent: {
    padding: 24,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 32,
  },
  voucherList: {
    gap: 20,
  },
  voucherCard: {
    flexDirection: 'row',
    height: 140,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  leftSection: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  offText: {
    fontSize: 12,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    marginTop: 4,
  },
  rightSection: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardInfo: {
    gap: 4,
  },
  vTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  vDesc: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '700',
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  expiryText: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.3)',
  },
  dashLine: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginVertical: 12,
  },
  copyBtn: {
    alignItems: 'flex-start',
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  topCircle: {
     position: 'absolute',
     top: -12,
     left: 88,
     width: 24,
     height: 24,
     borderRadius: 12,
     backgroundColor: '#F8F9FA',
  },
  bottomCircle: {
    position: 'absolute',
    bottom: -12,
    left: 88,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  promoInputBox: {
    marginTop: 40,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 28,
    ...SHADOWS.sm,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.3)',
    letterSpacing: 2,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  textInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  applyBtn: {

    backgroundColor: COLORS.onSurface,
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 12,
    marginRight: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 13,
  },
});
