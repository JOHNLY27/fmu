import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { createOrder, PaymentMethod } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import PaymentMethodSelector from '../components/ui/PaymentMethodSelector';

import { Modal } from 'react-native';

const { width, height } = Dimensions.get('window');

const sizes = [
  { key: 'small', label: 'LITE', icon: 'document-text', desc: 'Docs, Keys, Parcels', price: 60 },
  { key: 'medium', label: 'STANDARD', icon: 'cube', desc: 'Clothes, Gadgets', price: 100 },
  { key: 'large', label: 'MAX', icon: 'archive', desc: 'Bulk, Appliances', price: 150 },
];

export default function ParcelDeliveryScreen({ navigation }: any) {
  const { user } = useAuth();
  const [pickupData, setPickupData] = useState<any>(null);
  const [dropoffData, setDropoffData] = useState<any>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  const [itemDetails, setItemDetails] = useState('');
  const [parcelSize, setParcelSize] = useState('small');
  const [isBooking, setIsBooking] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const getDistance = (locA: any, locB: any) => {
    if (!locA || !locB) return null;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(locB.latitude - locA.latitude);
    const dLon = toRad(locB.longitude - locA.longitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(locA.latitude)) * Math.cos(toRad(locB.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  };

  useEffect(() => {
    const km = getDistance(pickupData, dropoffData);
    setDistanceKm(km);
  }, [pickupData, dropoffData]);

  const currentPrice = () => {
    const tier = sizes.find(s => s.key === parcelSize);
    if (!tier) return 60;
    if (!distanceKm) return tier.price;
    // Add distance surcharge: ₱10 per km after 3km
    const extra = distanceKm > 3 ? (distanceKm - 3) * 10 : 0;
    return Math.round(tier.price + extra);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSendParcel = async () => {
    if (!pickupData || !dropoffData || !itemDetails) {
      Alert.alert('Incomplete Logistics', 'Provide precise pickup, destination, and item specifications to initiate transit.');
      return;
    }
    setIsBooking(true);

    try {
      const orderId = await createOrder({
        userId: user?.uid || '',
        type: 'parcel',
        status: 'pending',
        pickupLocation: pickupData.address,
        pickupCoords: { latitude: pickupData.latitude, longitude: pickupData.longitude },
        dropoffLocation: dropoffData.address,
        dropoffCoords: { latitude: dropoffData.latitude, longitude: dropoffData.longitude },
        price: currentPrice(),
        paymentMethod: selectedPayment,
        paymentStatus: selectedPayment === 'cash' ? 'pending' : 'paid',
        itemDetails: `Parcel Session: ${itemDetails} (${parcelSize.toUpperCase()})`,
        customerCity: user?.location?.city || 'Butuan',
        customerProvince: user?.location?.province || 'Agusan del Norte',
      });

      navigation.replace('TrackingDetail', { orderId });
    } catch (e: any) {
      Alert.alert('System Error', e.message);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Immersive Logistics Header */}
      <View style={styles.logisticsHero}>
         <LinearGradient colors={['#0f1419', 'rgba(15,20,25,0.8)']} style={styles.heroOverlay} />
         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
         </TouchableOpacity>
         <View style={styles.heroContent}>
            <View style={styles.secureBadge}>
               <Ionicons name="shield-checkmark" size={14} color={COLORS.white} />
               <Text style={styles.secureText}>SECURE TRANSIT READY</Text>
            </View>
            <Text style={styles.heroTitle}>Parcel Logistics</Text>
            <Text style={styles.heroSub}>Fetch-and-Deliver missions across Butuan City</Text>
         </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
         <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
               
               {/* Context Panel */}
               <View style={styles.contextPanel}>
                  <View style={styles.contextIcon}>
                     <Ionicons name="cube" size={20} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                     <TextInput 
                        style={styles.specInput}
                        placeholder="SPECIFY CARGO (e.g. Legal Documents, Laptop)"
                        placeholderTextColor="rgba(0,0,0,0.3)"
                        value={itemDetails}
                        onChangeText={setItemDetails}
                     />
                     <Text style={styles.contextSub}>Detailed cargo description ensures mission success</Text>
                  </View>
               </View>

               {/* Logistics Tiers */}
               <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>LOAD SPECIFICATIONS</Text>
               </View>
               <View style={styles.tierGrid}>
                  {sizes.map((s) => (
                     <TouchableOpacity 
                        key={s.key} 
                        style={[styles.tierCard, parcelSize === s.key && styles.activeTier]}
                        onPress={() => setParcelSize(s.key)}
                     >
                        <Ionicons name={s.icon as any} size={28} color={parcelSize === s.key ? COLORS.white : 'rgba(0,0,0,0.2)'} />
                        <Text style={[styles.tierLabel, parcelSize === s.key && { color: COLORS.white }]}>{s.label}</Text>
                        <Text style={[styles.tierDesc, parcelSize === s.key && { color: 'rgba(255,255,255,0.6)' }]}>{s.desc}</Text>
                        <Text style={[styles.tierPrice, parcelSize === s.key && { color: COLORS.white }]}>₱{parcelSize === s.key ? currentPrice() : s.price}</Text>
                     </TouchableOpacity>

                  ))}
               </View>

               {/* Route Directives */}
               <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>TRANSIT COORDINATES</Text>
               </View>
               <View style={styles.routeCard}>
                  <View style={styles.routeVisual}>
                     <View style={styles.routeDot} />
                     <View style={styles.routeLine} />
                     <Ionicons name="location" size={16} color={COLORS.primary} />
                  </View>
                   <View style={{ flex: 1, gap: 12 }}>
                      <TouchableOpacity 
                        onPress={() => navigation.navigate('LocationPicker', { title: 'Pickup Point', onLocationSelect: (d: any) => setPickupData(d) })}
                      >
                         <Text style={{ fontSize: 9, fontWeight: '900', color: 'rgba(0,0,0,0.3)', marginBottom: 2 }}>PICKUP</Text>
                         <Text style={{ fontSize: 14, fontWeight: '800', color: pickupData ? COLORS.onSurface : 'rgba(0,0,0,0.2)' }} numberOfLines={1}>
                            {pickupData ? pickupData.address : 'Select Pick-up Location'}
                         </Text>
                      </TouchableOpacity>
                      
                      <View style={styles.hDivider} />
                      
                      <TouchableOpacity 
                        onPress={() => navigation.navigate('LocationPicker', { title: 'Drop-off Point', onLocationSelect: (d: any) => setDropoffData(d) })}
                      >
                         <Text style={{ fontSize: 9, fontWeight: '900', color: 'rgba(0,0,0,0.3)', marginBottom: 2 }}>DROPOFF</Text>
                         <Text style={{ fontSize: 14, fontWeight: '800', color: dropoffData ? COLORS.onSurface : 'rgba(0,0,0,0.2)' }} numberOfLines={1}>
                            {dropoffData ? dropoffData.address : 'Select Destination'}
                         </Text>
                      </TouchableOpacity>
                   </View>
               </View>

               {/* Summary Command */}
               <View style={styles.summaryBox}>
                   <View style={styles.sumRow}>
                      <Text style={styles.sumLabel}>ESTIMATED LOGISTICS FEE ({distanceKm || 0} KM)</Text>
                      <Text style={styles.sumVal}>₱{currentPrice().toFixed(2)}</Text>
                   </View>
                  
                  {/* Payment Selector Trigger */}
                  <TouchableOpacity 
                    style={styles.paymentTrigger} 
                    onPress={() => setShowPaymentModal(true)}
                  >
                     <Ionicons 
                        name={
                          selectedPayment === 'cash' ? 'cash-outline' : 
                          selectedPayment === 'gcash' ? 'wallet-outline' : 
                          selectedPayment === 'maya' ? 'card-outline' : 'card'
                        } 
                        size={16} 
                        color={COLORS.white} 
                     />
                     <Text style={styles.paymentText}>
                       {selectedPayment === 'cash' ? 'Cash on Delivery' : 
                        selectedPayment === 'gcash' ? 'GCash' : 
                        selectedPayment === 'maya' ? 'Maya' : 'Card'}
                     </Text>
                     <Ionicons name="chevron-down" size={12} color="rgba(255,255,255,0.4)" />
                  </TouchableOpacity>

                  <Button 
                     title={isBooking ? "Executing Mission..." : "Initiate Dispatch"} 
                     onPress={handleSendParcel}
                     loading={isBooking}
                     variant="primary"
                     size="xl"
                     fullWidth
                  />
                  <View style={styles.assuranceRow}>
                     <Ionicons name="checkmark-circle" size={14} color={COLORS.tertiary} />
                     <Text style={styles.assuranceText}>Real-time location telemetry enabled</Text>
                  </View>
               </View>

            </Animated.View>
         </ScrollView>
      </KeyboardAvoidingView>

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
  logisticsHero: {
    height: 250,
    width: '100%',
    justifyContent: 'flex-end',
    paddingBottom: 32,
    backgroundColor: '#0f1419',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    paddingHorizontal: 24,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  secureText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 60,
  },
  contextPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 24,
    gap: 16,
    ...SHADOWS.sm,
    marginBottom: 32,
  },
  contextIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specInput: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.onSurface,
    height: 30,
  },
  contextSub: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.3)',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: 'rgba(0,0,0,0.25)',
  },
  tierGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  tierCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    ...SHADOWS.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeTier: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.md,
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.3)',
    marginTop: 12,
    letterSpacing: 1,
  },
  tierDesc: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.25)',
    textAlign: 'center',
    marginTop: 4,
  },
  tierPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 10,
  },
  routeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    gap: 20,
    ...SHADOWS.sm,
    marginBottom: 32,
  },
  routeVisual: {
    alignItems: 'center',
    paddingVertical: 6,
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
  hDivider: {
    height: 1,
    backgroundColor: '#F8F9FA',
  },
  summaryBox: {
    backgroundColor: '#0f1419',
    borderRadius: 28,
    padding: 24,
    ...SHADOWS.lg,
  },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sumLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
  },
  sumVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
  },
  assuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  assuranceText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  paymentTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
  },
  paymentText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
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
