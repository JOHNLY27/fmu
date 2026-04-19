import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function ReceiptScreen({ navigation, route }: any) {
  const { data } = route.params || {};
  
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.spring(checkAnim, { toValue: 1, tension: 40, friction: 5, useNativeDriver: true }).start();
    }, 400);
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `FetchPay Success! ₱${data.amount} paid to ${data.target}. Ref: ${data.id}`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0f1419', '#1a202c']} style={StyleSheet.absoluteFillObject} />
      
      <Animated.View style={[styles.receiptCard, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
         {/* Success Header */}
         <View style={styles.successHeader}>
            <Animated.View style={[styles.checkCircle, { transform: [{ scale: checkAnim }] }]}>
               <Ionicons name="checkmark" size={40} color={COLORS.white} />
            </Animated.View>
            <Text style={styles.successTitle}>Payment Successful</Text>
            <Text style={styles.successSub}>Thank you for using FetchPay</Text>
         </View>

         <View style={styles.divider}>
            <View style={styles.dot} />
            <View style={styles.line} />
            <View style={styles.dot} />
         </View>

         {/* Transaction Details */}
         <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Merchant / Recipient</Text>
               <Text style={styles.detailValue}>{data.target || 'Fetch System'}</Text>
            </View>

            <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Transaction Type</Text>
               <Text style={styles.detailValue}>{data.type?.toUpperCase() || 'FINANCIAL DECK'}</Text>
            </View>

            <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Date & Time</Text>
               <Text style={styles.detailValue}>{new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>

            <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Reference ID</Text>
               <Text style={[styles.detailValue, { fontFamily: 'monospace' }]}>{data.id || 'FP-8874-XLPD'}</Text>
            </View>
         </View>

         <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>TOTAL AMOUNT PAID</Text>
            <Text style={styles.amountValue}>₱ {parseFloat(data.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
         </View>

         {/* Footer Actions */}
         <View style={styles.actions}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
               <Ionicons name="share-social-outline" size={20} color={COLORS.onSurface} />
               <Text style={styles.shareTxt}>Save as Receipt</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
               style={styles.doneBtn} 
               onPress={() => navigation.navigate('MainTabs')}
            >
               <Text style={styles.doneBtnText}>BACK TO COMMAND CENTER</Text>
            </TouchableOpacity>
         </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  receiptCard: {
    backgroundColor: COLORS.white,
    borderRadius: 32,
    padding: 32,
    ...SHADOWS.lg,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#00C853',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...SHADOWS.md,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f1419',
    letterSpacing: -0.5,
  },
  successSub: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '600',
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F3F5',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F3F5',
    borderStyle: 'dashed',
  },
  detailsContainer: {
    gap: 20,
    marginBottom: 40,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.3)',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'right',
    maxWidth: '60%',
  },
  amountSection: {
    backgroundColor: '#F8F9FA',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: 'rgba(0,0,0,0.3)',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f1419',
  },
  actions: {
    gap: 16,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  shareTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  doneBtn: {
    backgroundColor: '#0f1419',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});
