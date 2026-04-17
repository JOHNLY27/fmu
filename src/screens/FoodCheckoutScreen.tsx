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
import BarangaySelector from '../components/ui/BarangaySelector';
import Button from '../components/ui/Button';
import PaymentMethodSelector from '../components/ui/PaymentMethodSelector';

const { width, height } = Dimensions.get('window');

export default function FoodCheckoutScreen({ navigation, route }: any) {
  const { restaurant, cart, total } = route.params;
  const { user } = useAuth();
  
  const [dropoff, setDropoff] = useState('');
  const [notes, setNotes] = useState('');
  const [tip, setTip] = useState(20);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryFee = restaurant.deliveryFee || 35;
  const grandTotal = total + deliveryFee + tip;

  const handlePlaceOrder = async () => {
    if (!dropoff) {
      Alert.alert('Delivery Point Required', 'Please select your barangay for delivery.');
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
        dropoffLocation: `${dropoff}, Butuan City`,
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
        <View style={styles.destinationCard}>
           <BarangaySelector 
             value={dropoff}
             onSelect={setDropoff}
             label="SELECT BARANGAY"
             placeholder="Where should we deliver?"
           />
           <View style={styles.instructionBox}>
              <Ionicons name="chatbox" size={16} color="rgba(0,0,0,0.2)" />
              <Text style={styles.instructionText}>Riders will follow this location in Butuan.</Text>
           </View>
        </View>

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

           <View style={styles.grandTotalBox}>
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
});
