import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
  TextInput,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import Button from '../components/ui/Button';
import BarangaySelector from '../components/ui/BarangaySelector';
import { useAuth } from '../context/AuthContext';
import { createOrder, PaymentMethod } from '../services/orderService';
import PaymentMethodSelector from '../components/ui/PaymentMethodSelector';
import { Modal } from 'react-native';

const { width, height } = Dimensions.get('window');

const rideTiers = [
  { id: '1', name: 'Fetch Moto', sub: 'Tactical Single Motor', icon: 'bicycle', base: 45, kmRate: 12, img: 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=400' },
  { id: '2', name: 'Fetch Sedan', sub: 'Executive Comfort', icon: 'car-sport', base: 80, kmRate: 18, img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400' },
  { id: '3', name: 'Fetch Black', sub: 'Elite 4x4 Support', icon: 'shield-checkmark', base: 150, kmRate: 35, img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400' },
];

export default function RideSelectionScreen({ navigation }: any) {
  const { user } = useAuth();
  const [activeTier, setActiveTier] = useState(rideTiers[1]);
  const [pickupData, setPickupData] = useState<any>(null);
  const [dropoffData, setDropoffData] = useState<any>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Voucher Engine State
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);


  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const getDistance = (locA: any, locB: any) => {
    if (!locA || !locB) return null;
    
    // Haversine formula for real distance calculation
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(locB.latitude - locA.latitude);
    const dLon = toRad(locB.longitude - locA.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(locA.latitude)) * Math.cos(toRad(locB.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    
    // Minimum 1.5km for short rides
    return Math.max(1.5, parseFloat(d.toFixed(2)));
  };

  useEffect(() => {
    const km = getDistance(pickupData, dropoffData);
    setDistanceKm(km);
  }, [pickupData, dropoffData]);


  const calculatePrice = (tier: typeof rideTiers[0]) => {
    if (!distanceKm) return Math.max(0, tier.base - discountAmount);
    const raw = tier.base + (distanceKm * tier.kmRate);
    return Math.max(0, Math.round(raw - discountAmount));
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setIsValidating(true);
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      const q = query(collection(db, 'vouchers'), where('code', '==', voucherCode.toUpperCase()), where('isActive', '==', true));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        Alert.alert('Protocol Error', 'This promo code is invalid or has reached its lifecycle end.');
        setAppliedVoucher(null);
        setDiscountAmount(0);
        return;
      }

      const v = snap.docs[0].data();
      let disc = 0;
      const baseFare = activeTier.base;
      if (v.type === 'fixed') {
        disc = v.value;
      } else {
        disc = baseFare * (v.value / 100);
      }

      setAppliedVoucher(v);
      setDiscountAmount(disc);
      setShowVoucherModal(false);
      Alert.alert('Voucher Activated', `Trajectory discount of ₱${disc.toFixed(2)} synchronized.`);
      
    } catch (e) {
      Alert.alert('System Error', 'Could not sync with promotional hub.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleBooking = async () => {
    setIsBooking(true);
    try {
      const orderId = await createOrder({
        userId: user.uid,
        type: 'ride',
        status: 'pending',
        pickupLocation: pickupData.address,
        pickupCoords: { latitude: pickupData.latitude, longitude: pickupData.longitude },
        dropoffLocation: dropoffData.address,
        dropoffCoords: { latitude: dropoffData.latitude, longitude: dropoffData.longitude },
        price: calculatePrice(activeTier),
        paymentMethod: selectedPayment,
        paymentStatus: selectedPayment === 'cash' ? 'pending' : 'paid',
        itemDetails: `${activeTier.name} Session`,
        customerCity: user.location?.city || 'Butuan',
        customerProvince: user.location?.province || 'Agusan del Norte',
      });

      navigation.navigate('TrackingDetail', { orderId });
    } catch (e) {
      console.log(e);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Immersive Map Background */}
      <View style={styles.mapShell}>
         <MapView
            style={styles.map}
            initialRegion={{
              latitude: 8.9475,
              longitude: 125.5406,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            customMapStyle={mapStyle}
         >
            <Marker coordinate={{ latitude: 8.9475, longitude: 125.5406 }} />
         </MapView>
         
         <LinearGradient
            colors={['rgba(15,20,25,0.8)', 'transparent', '#0f1419']}
            style={styles.mapOverlay}
         />

         <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()}
         >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
         </TouchableOpacity>

         {/* Floating Route Card */}
         <View style={styles.routeCard}>
            <View style={styles.routeVisual}>
               <View style={styles.routeDot} />
               <View style={styles.routeLine} />
               <Ionicons name="location" size={16} color={COLORS.primary} />
            </View>
            <View style={styles.routeInputs}>
               <TouchableOpacity 
                 style={styles.locationInput}
                 onPress={() => navigation.navigate('LocationPicker', {
                   title: 'Set Pickup Point',
                   onLocationSelect: (data: any) => setPickupData(data)
                 })}
               >
                 <Text style={[styles.locationText, !pickupData && styles.placeholderText]} numberOfLines={1}>
                   {pickupData ? pickupData.address : 'Set Pickup Point'}
                 </Text>
               </TouchableOpacity>

               <View style={styles.inputDivider} />

               <TouchableOpacity 
                 style={styles.locationInput}
                 onPress={() => navigation.navigate('LocationPicker', {
                   title: 'Set Destination',
                   onLocationSelect: (data: any) => setDropoffData(data)
                 })}
               >
                 <Text style={[styles.locationText, !dropoffData && styles.placeholderText]} numberOfLines={1}>
                   {dropoffData ? dropoffData.address : 'Set Destination'}
                 </Text>
               </TouchableOpacity>
            </View>
         </View>

      </View>

      {/* Ride Selector Panel */}
      <Animated.View style={[styles.controlPanel, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
         <View style={styles.panelHeader}>
            <View style={styles.handle} />
            <Text style={styles.panelTitle}>SELECT TIER</Text>
         </View>

         <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tiersScroll}
          decelerationRate="fast"
          snapToInterval={width * 0.7 + 16}
         >
            {rideTiers.map((tier) => {
               const isActive = activeTier.id === tier.id;
               const price = calculatePrice(tier);
               
               return (
                  <TouchableOpacity 
                    key={tier.id} 
                    style={[styles.tierCard, isActive && styles.activeTierCard]}
                    onPress={() => setActiveTier(tier)}
                  >
                     <Image source={{ uri: tier.img }} style={styles.tierImg} />
                     <View style={styles.tierInfo}>
                        <View style={styles.tierHeader}>
                           <Text style={styles.tierName}>{tier.name}</Text>
                           <Ionicons name={tier.icon as any} size={14} color={isActive ? COLORS.primary : 'rgba(0,0,0,0.2)'} />
                        </View>
                        <Text style={styles.tierSub}>{tier.sub}</Text>
                        <View style={styles.tierFooter}>
                           <Text style={styles.tierPrice}>₱{price.toFixed(2)}</Text>
                           <View style={styles.etaBadge}>
                              <Text style={styles.etaText}>4 MIN</Text>
                           </View>
                        </View>
                     </View>
                  </TouchableOpacity>
               );
            })}
         </ScrollView>

         {/* Bottom Specifications */}
         <View style={styles.footerSpecs}>
            <TouchableOpacity 
              style={styles.specItem}
              onPress={() => setShowPaymentModal(true)}
            >
               <Ionicons 
                  name={
                    selectedPayment === 'cash' ? 'cash-outline' : 
                    selectedPayment === 'gcash' ? 'wallet-outline' : 
                    selectedPayment === 'maya' ? 'card-outline' : 'card'
                  } 
                  size={18} 
                  color={COLORS.primary} 
               />
               <Text style={styles.specText}>
                 {selectedPayment === 'cash' ? 'Cash on Delivery' : 
                  selectedPayment === 'gcash' ? 'GCash Pay' : 
                  selectedPayment === 'maya' ? 'Maya Pay' : 'Credit Card'}
               </Text>
               <Ionicons name="chevron-forward" size={14} color="rgba(0,0,0,0.2)" />
            </TouchableOpacity>
            <View style={styles.vDivider} />
            <TouchableOpacity 
              style={styles.specItem}
              onPress={() => setShowVoucherModal(true)}
            >
               <Ionicons name="gift-outline" size={16} color={appliedVoucher ? '#10b981' : COLORS.primary} />
               <Text style={[styles.specText, appliedVoucher && { color: '#10b981' }]}>
                 {appliedVoucher ? `DISCOUNT (-₱${discountAmount.toFixed(0)})` : 'Vouchers'}
               </Text>
            </TouchableOpacity>
         </View>

         {/* Voucher Input Modal */}
         <Modal
            visible={showVoucherModal}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setShowVoucherModal(false)}
         >
            <View style={styles.modalOverlay}>
               <TouchableOpacity 
                  style={styles.modalDismiss} 
                  activeOpacity={1} 
                  onPress={() => setShowVoucherModal(false)} 
               />
               <View style={[styles.modalContent, { padding: 24, paddingBottom: 40 }]}>
                  <View style={styles.modalHandle} />
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f1419', marginBottom: 8 }}>Apply Promo Code</Text>
                  <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.4)', marginBottom: 20 }}>Unlock lower trajectory fares with valid mission protocols.</Text>
                  
                  <View style={styles.rideVoucherRow}>
                     <TextInput 
                        style={styles.rideVoucherInput}
                        placeholder="ENTER VOUCHER CODE"
                        value={voucherCode}
                        onChangeText={setVoucherCode}
                        autoCapitalize="characters"
                     />
                     <TouchableOpacity 
                        style={styles.rideApplyBtn}
                        onPress={handleApplyVoucher}
                        disabled={isValidating || !voucherCode}
                     >
                        <Text style={styles.rideApplyBtnText}>{isValidating ? '...' : 'APPLY'}</Text>
                     </TouchableOpacity>
                  </View>
                  {appliedVoucher && (
                    <TouchableOpacity 
                      style={{ marginTop: 12, alignItems: 'center' }}
                      onPress={() => { setAppliedVoucher(null); setDiscountAmount(0); setVoucherCode(''); }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#ef4444' }}>REMOVE ACTIVE VOUCHER</Text>
                    </TouchableOpacity>
                  )}
               </View>
            </View>
         </Modal>

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

         <Button 
            title={pickupData && dropoffData ? `Confirm ${activeTier.name}` : 'Select Coordinates'} 
            onPress={handleBooking}
            loading={isBooking}
            variant="primary"
            size="xl"
            fullWidth
            disabled={!pickupData || !dropoffData}
            icon={<Ionicons name="shield-checkmark" size={20} color={COLORS.white} />}
         />

      </Animated.View>
    </View>
  );
}

const mapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#1d2c4d" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#8ec3b9" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a3646" }] },
  // ... extra styling omitted for brevity in scratchpad but implied for high-end look
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  mapShell: {
    height: height * 0.55,
    width: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  routeCard: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    ...SHADOWS.lg,
  },
  routeVisual: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  routeDot: {
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
  routeInputs: {
    flex: 1,
  },
  inputDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 4,
  },
  locationInput: {
    height: 40,
    justifyContent: 'center',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f1419',
  },
  placeholderText: {
    color: 'rgba(0,0,0,0.3)',
    fontWeight: '500',
  },

  controlPanel: {
    flex: 1,
    marginTop: -32,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },
  panelHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F1F3F5',
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: 'rgba(0,0,0,0.3)',
  },
  tiersScroll: {
    paddingRight: 20,
    paddingBottom: 32,
    gap: 16,
  },
  tierCard: {
    width: width * 0.7,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 16,
    ...SHADOWS.sm,
    borderWidth: 2,
    borderColor: '#F8F9FA',
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  activeTierCard: {
    borderColor: COLORS.primary,
    ...SHADOWS.md,
  },
  tierImg: {
    width: 80,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
  },
  tierInfo: {
    flex: 1,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  tierSub: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 2,
    fontWeight: '600',
  },
  tierFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  tierPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  etaBadge: {
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  etaText: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.4)',
  },
  footerSpecs: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  vDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E9ECEF',
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
  rideVoucherRow: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    height: 56,
    paddingLeft: 16,
    paddingRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  rideVoucherInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#0f1419',
  },
  rideApplyBtn: {
    backgroundColor: '#0f1419',
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rideApplyBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },
});
