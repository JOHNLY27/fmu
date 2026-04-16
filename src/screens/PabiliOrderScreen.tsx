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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { Store } from '../types';
import { createOrder } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import BarangaySelector from '../components/ui/BarangaySelector';
import Button from '../components/ui/Button';

const { width } = Dimensions.get('window');

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
  const { user } = useAuth();
  
  const [items, setItems] = useState<PabiliItemInput[]>([createEmptyItem()]);
  const [quickCommand, setQuickCommand] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [tip, setTip] = useState(20);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    if ((!quickCommand.trim() && validItems.length === 0) || !dropoff) {
      Alert.alert('Incomplete Session', 'Provide a Quick Directive or add Items to proceed.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const summary = validItems.map(i => `${i.quantity}x ${i.name}`).join(', ');
      const orderId = await createOrder({
        userId: user?.uid || '',
        type: 'pabili',
        pickupLocation: store.name,
        dropoffLocation: `${dropoff}, Butuan`,
        price: 49 + tip, 
        itemDetails: `Personal Command: ${quickCommand ? quickCommand : summary}`,
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
      
      {/* Store Identity Header */}
      <View style={styles.storeHero}>
         <Image source={{ uri: store.image }} style={styles.heroImg} />
         <LinearGradient colors={['rgba(0,0,0,0.5)', '#0f1419']} style={styles.heroOverlay} />
         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
         </TouchableOpacity>
         <View style={styles.heroContent}>
            <View style={styles.verifiedBadge}>
               <Ionicons name="shield-checkmark" size={14} color={COLORS.white} />
               <Text style={styles.verifiedText}>RELIABLE PARTNER</Text>
            </View>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.storeLoc}>{store.barangay}, Butuan City</Text>
         </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
         <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
               
               {/* Coordinate Block */}
               <View style={styles.coordBlock}>
                  <View style={styles.coordIcon}>
                     <Ionicons name="navigate" size={18} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                     <BarangaySelector 
                        value={dropoff} 
                        onSelect={setDropoff} 
                        placeholder="Set Dropoff Coordinates" 
                        variant="minimal"
                     />
                     <Text style={styles.coordSub}>Your agent will execute directives and deliver here</Text>
                  </View>
               </View>

               {/* Quick Command Box */}
               <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>QUICK DIRECTIVE</Text>
               </View>
               <View style={styles.commandBlock}>
                  <TextInput
                    style={styles.commandInput}
                    placeholder="Type your full command here (e.g. 'Buy me 2 milk and specific snacks')"
                    placeholderTextColor="rgba(0,0,0,0.3)"
                    multiline
                    value={quickCommand}
                    onChangeText={setQuickCommand}
                  />
                  <View style={styles.voiceIndicator}>
                     <Ionicons name="mic" size={16} color={COLORS.primary} />
                  </View>
               </View>

               {/* Item Procurement List */}
               <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>STRUCTURED DIRECTIVES (OPTIONAL)</Text>
                  <TouchableOpacity onPress={addItem}>
                     <Text style={styles.addText}>+ ADD ITEM</Text>
                  </TouchableOpacity>
               </View>

               {items.map((item, idx) => (
                  <View key={item.id} style={styles.itemCard}>
                     <View style={styles.cardHeader}>
                        <View style={styles.itemIdx}><Text style={styles.idxText}>{idx + 1}</Text></View>
                        <TextInput 
                           style={styles.itemTitleInput}
                           placeholder="Item Name (e.g. Milk 1L)"
                           value={item.name}
                           onChangeText={(v) => updateItem(item.id, 'name', v)}
                        />
                        <View style={styles.qtyBox}>
                           <TextInput 
                              style={styles.qtyInput}
                              value={item.quantity}
                              onChangeText={(v) => updateItem(item.id, 'quantity', v)}
                              keyboardType="numeric"
                           />
                        </View>
                        {items.length > 1 && (
                           <TouchableOpacity onPress={() => removeItem(item.id)}>
                              <Ionicons name="close-circle" size={20} color="rgba(0,0,0,0.1)" />
                           </TouchableOpacity>
                        )}
                     </View>
                     <TextInput 
                        style={styles.noteInput}
                        placeholder="Add Brand, Size or Variant (optional)"
                        value={item.notes}
                        onChangeText={(v) => updateItem(item.id, 'notes', v)}
                        placeholderTextColor="rgba(0,0,0,0.3)"
                     />
                  </View>
               ))}

               {/* Tip Section */}
               <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>RIDER APPRECIATION</Text>
               </View>
               <View style={styles.tipRow}>
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

               {/* Summary Card */}
               <View style={styles.summaryCard}>
                  <View style={styles.sumRow}>
                     <Text style={styles.sumLabel}>Service Procurement Fee</Text>
                     <Text style={styles.sumVal}>₱49.00</Text>
                  </View>
                  <View style={styles.sumRow}>
                     <Text style={styles.sumLabel}>Rider Tip</Text>
                     <Text style={styles.sumVal}>₱{tip.toFixed(2)}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.totalRow}>
                     <Text style={styles.totalLabel}>Service Total</Text>
                     <Text style={styles.totalVal}>₱{(49 + tip).toFixed(2)}</Text>
                  </View>
                  <Text style={styles.disclaimer}>* Items cost will be paid directly to the rider upon delivery.</Text>
               </View>

               <Button 
                  title={isSubmitting ? "Executing Command..." : "Issue Mission Command"} 
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  variant="primary"
                  size="xl"
                  fullWidth
               />
               <Text style={styles.subText}>Riders will contact you regarding stock availability.</Text>

            </Animated.View>
         </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  storeHero: {
    height: 250,
    width: '100%',
    justifyContent: 'flex-end',
    paddingBottom: 32,
  },
  heroImg: {
    ...StyleSheet.absoluteFillObject,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    paddingHorizontal: 24,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  verifiedText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
  storeName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  storeLoc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 60,
  },
  coordBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    gap: 16,
    ...SHADOWS.sm,
    marginBottom: 32,
  },
  coordIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coordSub: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.3)',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: 'rgba(0,0,0,0.25)',
  },
  addText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIdx: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idxText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.3)',
  },
  itemTitleInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  qtyBox: {
    width: 44,
    height: 32,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyInput: {
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    color: COLORS.primary,
  },
  noteInput: {
    marginTop: 12,
    marginLeft: 36,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  tipChip: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  activeTip: {
    backgroundColor: COLORS.primary,
  },
  tipText: {
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.4)',
  },
  activeTipText: {
    color: COLORS.white,
  },
  summaryCard: {
    backgroundColor: '#F1F3F5',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sumLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.4)',
  },
  sumVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  totalVal: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  disclaimer: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.35)',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  subText: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(0,0,0,0.3)',
    marginTop: 16,
    fontWeight: '600',
  },
  commandBlock: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    ...SHADOWS.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commandInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    minHeight: 40,
  },
  voiceIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
