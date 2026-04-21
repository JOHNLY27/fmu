import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants/theme';
import { Restaurant, MenuItem, Order } from '../types';
import { createOrder, PaymentMethod } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import PaymentMethodSelector from '../components/ui/PaymentMethodSelector';
import Input from '../components/ui/Input';
import { db } from '../config/firebase';

const { width, height } = Dimensions.get('window');

export default function FoodCheckoutScreen({ navigation, route }: any) {
  const { restaurant, cart, total } = route.params;
  const { user } = useAuth();
  
  const [dropoffData, setDropoffData] = useState<any>(null);

  const [notes, setNotes] = useState('');
  const [tip, setTip] = useState(20);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Voucher Engine State
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  const deliveryFee = restaurant.deliveryFee || 35;
  const grandTotal = Math.max(0, (total + deliveryFee + tip) - discountAmount);


  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setIsValidating(true);
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const q = query(collection(db, 'vouchers'), where('code', '==', voucherCode.toUpperCase()), where('isActive', '==', true));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        Alert.alert('Invalid Code', 'This protocol does not exist or has expired.');
        setAppliedVoucher(null);
        setDiscountAmount(0);
        return;
      }

      const v = snap.docs[0].data();
      let disc = 0;
      if (v.type === 'fixed') {
        disc = v.value;
      } else {
        disc = total * (v.value / 100);
      }

      setAppliedVoucher(v);
      setDiscountAmount(disc);
      Alert.alert('Voucher Applied', `Savings of ₱${disc.toFixed(2)} synchronized.`);
      
    } catch (e) {
      Alert.alert('System Error', 'Could not validate promo protocol.');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePlaceOrder = async () => {

    if (!dropoffData) {
      Alert.alert('Delivery Point Required', 'Please select your precise delivery point on the map.');
      return;
    }


    setIsSubmitting(true);
    try {
      const orderItems = cart.map((c: any) => `${c.qty}x ${c.item.name}`).join(', ');
      
      const orderId = await createOrder({
        userId: user?.uid || '',
        type: 'food',
        status: 'pending',
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        pickupLocation: restaurant.name,
        dropoffLocation: dropoffData.address,
        dropoffCoords: { latitude: dropoffData.latitude, longitude: dropoffData.longitude },
        price: grandTotal,
        paymentMethod: selectedPayment,
        paymentStatus: selectedPayment === 'cash' ? 'pending' : 'paid',

        itemDetails: orderItems,
        customerCity: user?.location?.city || 'Butuan',
        customerProvince: user?.location?.province || 'Agusan del Norte',
      });

      navigation.navigate('TrackingDetail', { orderId });
    } catch (e: any) {
      Alert.alert('Ordering Error', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Mini Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Order Checkout</Text>
          <Text style={styles.headerSub}>{restaurant.name}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ORDER SUMMARY CARD */}
        <View style={styles.cardHeader}>
           <Text style={styles.sectionTitle}>BASKET SUMMARY</Text>
        </View>
        <View style={styles.summaryCard}>
           {cart.map((c: any, i: number) => (
             <View key={i} style={styles.cartItem}>
                <View style={styles.qtyBox}><Text style={styles.qtyText}>{c.qty}</Text></View>
                <Text style={styles.itemName}>{c.item.name}</Text>
                <Text style={styles.itemPrice}>₱{(c.item.price * c.qty).toFixed(2)}</Text>
             </View>
           ))}
           <View style={styles.divider} />
           <View style={styles.totalRow}>
              <Text style={styles.basketTotalLabel}>Basket Subtotal</Text>
              <Text style={styles.basketTotalVal}>₱{total.toFixed(2)}</Text>
           </View>
        </View>

        {/* DELIVERY COORDS */}
        <View style={[styles.cardHeader, { marginTop: 32 }]}>
           <Text style={styles.sectionTitle}>DELIVERY DESTINATION</Text>
        </View>
         <TouchableOpacity 
           style={styles.destinationCard}
           onPress={() => navigation.navigate('LocationPicker', {
             title: 'Delivery Destination',
             onLocationSelect: (data: any) => setDropoffData(data)
           })}
         >
           <Text style={styles.sectionTitle}>PICKUP & DROP-OFF</Text>
           <View style={{ marginTop: 8 }}>
             <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.onSurface }}>{restaurant.name}</Text>
             <Ionicons name="arrow-down" size={12} color="rgba(0,0,0,0.1)" style={{ marginVertical: 2, marginLeft: 2 }} />
             <Text style={{ fontSize: 14, fontWeight: '800', color: dropoffData ? COLORS.primary : 'rgba(0,0,0,0.2)' }} numberOfLines={1}>
                {dropoffData ? dropoffData.address : 'Tap to pin delivery location...'}
             </Text>
           </View>
           <View style={styles.instructionBox}>
              <Ionicons name="map-outline" size={16} color={COLORS.primary} />
              <Text style={styles.instructionText}>Precision coordinate tracking enabled.</Text>
           </View>
         </TouchableOpacity>


        {/* PAYMENT & FEES */}
        <View style={[styles.cardHeader, { marginTop: 32 }]}>
           <Text style={styles.sectionTitle}>PAYMENT & REWARDS</Text>
        </View>
        <View style={styles.paymentCard}>
           
           <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Standard Delivery Fee</Text>
              <Text style={styles.feeVal}>₱{deliveryFee.toFixed(2)}</Text>
           </View>
           
           {/* Tip Selector */}
           <View style={styles.tipRow}>
              <Text style={styles.tipMainLabel}>Rider Appreciation Tip</Text>
              <View style={styles.tipOptions}>
                 {[20, 50, 100].map(amt => (
                    <TouchableOpacity 
                      key={amt} 
                      style={[styles.tipChip, tip === amt && styles.activeTip]}
                      onPress={() => setTip(amt)}
                    >
                       <Text style={[styles.tipText, tip === amt && styles.activeTipText]}>₱{amt}</Text>
                    </TouchableOpacity>
                 ))}
              </View>
           </View>

           <TouchableOpacity 
              style={styles.paymentSelector} 
              onPress={() => setShowPaymentModal(true)}
           >
              <View style={styles.payIconBox}>
                 <Ionicons 
                    name={
                      selectedPayment === 'cash' ? 'cash' : 
                      selectedPayment === 'gcash' ? 'wallet' : 'card'
                    } 
                    size={20} 
                    color={COLORS.primary} 
                 />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                 <Text style={styles.payMainText}>
                    {selectedPayment === 'cash' ? 'Cash on Delivery' : selectedPayment.toUpperCase()}
                 </Text>
                 <Text style={styles.paySubText}>Secure and verified checkout</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(0,0,0,0.2)" />
           </TouchableOpacity>

           {/* Voucher Console HUD */}
           <View style={styles.voucherSection}>
              <View style={styles.voucherInputRow}>
                 <Ionicons name="ticket-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                 <View style={{ flex: 1 }}>
                   <Input 
                     placeholder="PROMO CODE" 
                     value={voucherCode} 
                     onChangeText={setVoucherCode}
                     autoCapitalize="characters"
                     variant="plain"
                     style={{ height: 40, marginVertical: 0 }}
                   />
                 </View>
                 <TouchableOpacity 
                   style={[styles.applyBtn, !voucherCode && { opacity: 0.5 }]} 
                   onPress={handleApplyVoucher}
                   disabled={isValidating || !voucherCode}
                 >
                   <Text style={styles.applyBtnText}>{isValidating ? '...' : 'APPLY'}</Text>
                 </TouchableOpacity>
              </View>
              {appliedVoucher && (
                <View style={styles.appliedBadge}>
                   <Ionicons name="checkmark-seal" size={14} color="#10b981" />
                   <Text style={styles.appliedText} numberOfLines={1}>
                      {appliedVoucher.code} ACTIVATED: -₱{discountAmount.toFixed(2)}
                   </Text>
                   <TouchableOpacity onPress={() => { setAppliedVoucher(null); setDiscountAmount(0); setVoucherCode(''); }}>
                     <Ionicons name="close-circle" size={16} color="rgba(0,0,0,0.3)" />
                   </TouchableOpacity>
                </View>
              )}
           </View>

           <View style={styles.grandTotalBox}>
              {discountAmount > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8, paddingHorizontal: 4 }}>
                   <Text style={{ fontSize: 13, fontWeight: '700', color: '#10b981' }}>Promo Discount</Text>
                   <Text style={{ fontSize: 13, fontWeight: '900', color: '#10b981' }}>-₱{discountAmount.toFixed(2)}</Text>
                </View>
              )}
              <Text style={styles.grandLabel}>GRAND TOTAL</Text>
              <Text style={styles.grandVal}>₱{grandTotal.toFixed(2)}</Text>
           </View>
        </View>

        <Button 
          title={isSubmitting ? "PROCESSING ORDER..." : "PLACE ORDER NOW"} 
          onPress={handlePlaceOrder}
          variant="primary"
          size="xl"
          loading={isSubmitting}
          fullWidth
        />
        <Text style={styles.finalDisclaimer}>
           By placing an order, you agree to our terms of service regarding food preparation and delivery.
        </Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Payment Selection Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalDismiss} 
            activeOpacity={1} 
            onPress={() => setShowPaymentModal(false)} 
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <PaymentMethodSelector 
              selected={selectedPayment}
              onSelect={(method) => {
                setSelectedPayment(method);
                setShowPaymentModal(false);
              }}
            />
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    height: 120,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    ...SHADOWS.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  cardHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: 'rgba(0,0,0,0.3)',
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.sm,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  qtyBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  basketTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.4)',
  },
  basketTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  destinationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.sm,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
  },
  instructionText: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.3)',
    fontWeight: '600',
  },
  paymentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    ...SHADOWS.sm,
  },
  feeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  feeLabel: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '700',
  },
  feeVal: {
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  tipRow: {
    marginBottom: 20,
  },
  tipMainLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.25)',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  tipOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  tipChip: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  activeTip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tipText: {
    fontSize: 14,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.4)',
  },
  activeTipText: {
    color: COLORS.white,
  },
  paymentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  payIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.xs,
  },
  payMainText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  paySubText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.3)',
    marginTop: 2,
  },
  grandTotalBox: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  grandLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.3)',
    letterSpacing: 1.5,
  },
  grandVal: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 4,
  },
  finalDisclaimer: {
    textAlign: 'center',
    fontSize: 10,
    color: 'rgba(0,0,0,0.3)',
    marginTop: 20,
    fontWeight: '600',
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: height * 0.85,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  voucherSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  voucherInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingLeft: 12,
    paddingRight: 6,
    height: 52,
    ...SHADOWS.xs,
  },
  applyBtn: {
    backgroundColor: COLORS.onSurface,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  appliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    gap: 8,
  },
  appliedText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: '#10b981',
  },
});
