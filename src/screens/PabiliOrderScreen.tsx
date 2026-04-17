import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { Store } from '../types';
import { createOrder, PaymentMethod } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import BarangaySelector from '../components/ui/BarangaySelector';
import Button from '../components/ui/Button';
import PaymentMethodSelector from '../components/ui/PaymentMethodSelector';

const { width, height } = Dimensions.get('window');

interface PabiliItemInput {
  id: string;
  name: string;
  quantity: string;
  notes: string;
}

const createEmptyItem = (): PabiliItemInput => ({
  id: Math.random().toString(36).substr(2, 9),
  name: '',
  quantity: '1',
  notes: '',
});

export default function PabiliOrderScreen({ navigation, route }: any) {
  const store: Store = route.params?.store;
  const isGeneral = store?.id === 'general';
  const { user } = useAuth();
  
  const [items, setItems] = useState<PabiliItemInput[]>([createEmptyItem()]);
  const [quickCommand, setQuickCommand] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [tip, setTip] = useState(20);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [requestMode, setRequestMode] = useState<'list' | 'note'>(isGeneral ? 'note' : 'list');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const addItem = () => setItems(prev => [...prev, createEmptyItem()]);
  const removeItem = (id: string) => items.length > 1 && setItems(prev => prev.filter(i => i.id !== id));
  
  const updateItem = (id: string, field: keyof PabiliItemInput, value: string) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const handleSubmit = async () => {
    const validItems = items.filter(i => i.name.trim());
    if (requestMode === 'note' && !quickCommand.trim()) {
      Alert.alert('Empty Mission', 'Please specify what you want us to buy in the note.');
      return;
    }
    if (requestMode === 'list' && validItems.length === 0) {
      Alert.alert('Empty List', 'Add at least one item to your shopping list.');
      return;
    }
    if (!dropoff) {
      Alert.alert('No Destination', 'Choose where we should deliver your items.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const summary = validItems.map(i => `${i.quantity}x ${i.name}`).join(', ');
      const orderId = await createOrder({
        userId: user?.uid || '',
        type: 'pabili',
        status: 'pending',
        pickupLocation: isGeneral ? (quickCommand.split('from')[1]?.trim() || 'Anywhere') : store.name,
        dropoffLocation: `${dropoff}, Butuan`,
        price: 49 + tip, 
        paymentMethod: selectedPayment,
        paymentStatus: selectedPayment === 'cash' ? 'pending' : 'paid',
        itemDetails: requestMode === 'note' ? quickCommand : `List: ${summary}`,
        customerCity: user?.location?.city || 'Butuan',
        customerProvince: user?.location?.province || 'Agusan del Norte',
      });
      navigation.navigate('TrackingDetail', { orderId });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Dynamic Header */}
      <View style={styles.storeHero}>
         <Image source={{ uri: store.image }} style={styles.heroImg} />
         <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)']} style={styles.heroOverlay} />
         
         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
         </TouchableOpacity>

         <View style={styles.heroContent}>
            <View style={styles.storeIdentifier}>
               <View style={styles.categoryBadge}>
                  <Text style={styles.catEmoji}>{isGeneral ? '⚡' : '🏬'}</Text>
               </View>
               <View>
                  <Text style={styles.storeName}>{isGeneral ? 'General Request' : store.name}</Text>
                  <Text style={styles.storeLabel}>{isGeneral ? 'Butuan City Explorer' : store.category}</Text>
               </View>
            </View>
         </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
         <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
               
               {/* STEP 1: DESTINATION */}
               <View style={styles.cardHeader}>
                  <View style={styles.stepCircle}><Text style={styles.stepText}>1</Text></View>
                  <Text style={styles.stepTitle}>WHERE SHOULD WE BRING IT?</Text>
               </View>
               
               <View style={styles.destinationCard}>
                  <View style={styles.destIconBox}>
                     <Ionicons name="location" size={22} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                     <BarangaySelector 
                        value={dropoff} 
                        onSelect={setDropoff} 
                        label="SELECT DROP-OFF BARANGAY"
                        placeholder="Choose your location in Butuan..."
                     />
                     <Text style={styles.destGuide}>We'll deliver right to your door in this barangay.</Text>
                  </View>
               </View>

               {/* STEP 2: WHAT TO BUY */}
               <View style={[styles.cardHeader, { marginTop: 32 }]}>
                  <View style={styles.stepCircle}><Text style={styles.stepText}>2</Text></View>
                  <Text style={styles.stepTitle}>WHAT ARE WE BUYING?</Text>
               </View>

               {/* Request Mode Toggle */}
               <View style={styles.modeToggle}>
                  <TouchableOpacity 
                    style={[styles.modeBtn, requestMode === 'list' && styles.activeMode]} 
                    onPress={() => setRequestMode('list')}
                  >
                     <Ionicons name="list" size={18} color={requestMode === 'list' ? COLORS.white : 'rgba(0,0,0,0.4)'} />
                     <Text style={[styles.modeText, requestMode === 'list' && styles.activeModeText]}>Shopping List</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modeBtn, requestMode === 'note' && styles.activeMode]} 
                    onPress={() => setRequestMode('note')}
                  >
                     <Ionicons name="document-text" size={18} color={requestMode === 'note' ? COLORS.white : 'rgba(0,0,0,0.4)'} />
                     <Text style={[styles.modeText, requestMode === 'note' && styles.activeModeText]}>Note Only</Text>
                  </TouchableOpacity>
               </View>

               {requestMode === 'list' ? (
                 <View>
                    {items.map((item, idx) => (
                      <View key={item.id} style={styles.itemContainer}>
                         <View style={styles.itemMainRow}>
                            <View style={styles.itemNum}><Text style={styles.numText}>{idx + 1}</Text></View>
                            <View style={{ flex: 1 }}>
                               <Text style={styles.inputLabel}>ITEM NAME</Text>
                               <TextInput 
                                 style={styles.itemInput}
                                 placeholder="e.g. 1L Milk, Mineral Water..."
                                 value={item.name}
                                 onChangeText={(v) => updateItem(item.id, 'name', v)}
                               />
                            </View>
                            <View style={styles.qtyContainer}>
                               <Text style={styles.inputLabel}>QTY</Text>
                               <TextInput 
                                 style={styles.qtyInput}
                                 value={item.quantity}
                                 keyboardType="numeric"
                                 onChangeText={(v) => updateItem(item.id, 'quantity', v)}
                               />
                            </View>
                            {items.length > 1 && (
                              <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.id)}>
                                 <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                              </TouchableOpacity>
                            )}
                         </View>
                         <TextInput 
                            style={styles.notesInput}
                            placeholder="Add Brand, Flavor or Size (Optional)"
                            placeholderTextColor="rgba(0,0,0,0.3)"
                            value={item.notes}
                            onChangeText={(v) => updateItem(item.id, 'notes', v)}
                         />
                      </View>
                    ))}
                    <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
                       <Ionicons name="add-circle" size={20} color={COLORS.primary} />
                       <Text style={styles.addItemText}>Add another item</Text>
                    </TouchableOpacity>
                 </View>
               ) : (
                 <View style={styles.commandCard}>
                    <Text style={styles.inputLabel}>WRITE YOUR COMMAND</Text>
                    <TextInput 
                       style={styles.commandInput}
                       placeholder={isGeneral ? "Example: 'Buy 2 burgers from Jollibee Langihan'" : "Example: 'Get me 2 packs of eggs and 1 loaf of bread'"}
                       multiline
                       numberOfLines={4}
                       value={quickCommand}
                       onChangeText={setQuickCommand}
                    />
                    <Text style={styles.commandGuide}>Provide specific details so our agents can fetch it correctly.</Text>
                 </View>
               )}

               {/* STEP 3: PAYMENT & SUMMARY */}
               <View style={[styles.cardHeader, { marginTop: 32 }]}>
                  <View style={styles.stepCircle}><Text style={styles.stepText}>3</Text></View>
                  <Text style={styles.stepTitle}>CONFIRM MISSION</Text>
               </View>

               <View style={styles.summaryBox}>
                  {/* Tip Selector */}
                  <View style={styles.tipSection}>
                     <Text style={styles.tipLabel}>APPRECIATION TIP</Text>
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

                  <View style={styles.feesList}>
                     <View style={styles.feeItem}>
                        <Text style={styles.feeLabel}>Service Concierge Fee</Text>
                        <Text style={styles.feeVal}>₱49.00</Text>
                     </View>
                     <View style={styles.feeItem}>
                        <Text style={styles.feeLabel}>Reward Tip</Text>
                        <Text style={styles.feeVal}>₱{tip.toFixed(2)}</Text>
                     </View>
                     
                     <TouchableOpacity 
                       style={styles.paymentModule} 
                       onPress={() => setShowPaymentModal(true)}
                     >
                        <Ionicons 
                          name={
                            selectedPayment === 'cash' ? 'cash' : 
                            selectedPayment === 'gcash' ? 'wallet' : 
                            selectedPayment === 'maya' ? 'card' : 'card'
                          } 
                          size={18} 
                          color={COLORS.primary} 
                        />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                           <Text style={styles.payOptionText}>
                             {selectedPayment === 'cash' ? 'Cash on Delivery' : 
                              selectedPayment.toUpperCase() + ' (Digital)'}
                           </Text>
                           <Text style={styles.paySub}>Tap to change</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="rgba(0,0,0,0.2)" />
                     </TouchableOpacity>

                     <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>TOTAL SERVICE</Text>
                        <Text style={styles.totalBig}>₱{(49 + tip).toFixed(2)}</Text>
                     </View>
                  </View>

                  <View style={styles.disclaimerContainer}>
                     <Ionicons name="alert-circle" size={16} color="rgba(0,0,0,0.3)" />
                     <Text style={styles.priceDisclaimer}>
                        Item costs will be paid directly to the rider upon arrival.
                     </Text>
                  </View>
               </View>

               <Button 
                  title={isSubmitting ? "TRANSMITTING MISSION..." : "EXECUTE PABILI MISSION"} 
                  onPress={handleSubmit}
                  variant="primary"
                  loading={isSubmitting}
                  size="xl"
                  fullWidth
               />
               <Text style={styles.finalNote}>Our closest rider will contact you for item verification.</Text>

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
    backgroundColor: '#F1F3F5',
  },
  storeHero: {
    height: 220,
    width: '100%',
    justifyContent: 'flex-end',
  },
  heroImg: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  storeIdentifier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  categoryBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  catEmoji: {
    fontSize: 20,
  },
  storeName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  storeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.onSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: 'rgba(0,0,0,0.4)',
  },
  destinationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    ...SHADOWS.md,
  },
  destIconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destGuide: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.3)',
    fontWeight: '600',
    marginTop: 4,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 6,
    borderRadius: 18,
    marginBottom: 20,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 14,
  },
  activeMode: {
    backgroundColor: COLORS.onSurface,
    ...SHADOWS.sm,
  },
  modeText: {
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.4)',
  },
  activeModeText: {
    color: COLORS.white,
  },
  itemContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  itemMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  itemNum: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  numText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.3)',
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.4)',
    letterSpacing: 1,
    marginBottom: 6,
  },
  itemInput: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    paddingBottom: 8,
  },
  qtyContainer: {
    width: 60,
  },
  qtyInput: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'center',
    backgroundColor: '#F8F9FA',
    height: 36,
    borderRadius: 10,
  },
  removeBtn: {
    padding: 8,
  },
  notesInput: {
    marginTop: 16,
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '600',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
    borderStyle: 'dashed',
    borderRadius: 20,
    marginTop: 8,
  },
  addItemText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  commandCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.md,
  },
  commandInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  commandGuide: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.3)',
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryBox: {
    backgroundColor: COLORS.white,
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    ...SHADOWS.md,
  },
  tipSection: {
    marginBottom: 24,
  },
  tipLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: 'rgba(0,0,0,0.3)',
    marginBottom: 12,
    textAlign: 'center',
  },
  tipOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  tipChip: {
    flex: 1,
    height: 48,
    borderRadius: 16,
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
    fontWeight: '900',
    color: 'rgba(0,0,0,0.4)',
  },
  activeTipText: {
    color: COLORS.white,
  },
  feesList: {
    gap: 14,
  },
  feeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeLabel: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '600',
  },
  feeVal: {
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  paymentModule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 20,
    marginVertical: 8,
  },
  payOptionText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  paySub: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  totalBig: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 12,
  },
  priceDisclaimer: {
    flex: 1,
    fontSize: 10,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  finalNote: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(0,0,0,0.3)',
    marginTop: 16,
    fontWeight: '600',
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
