import React, { useState, useRef } from 'react';
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
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { Store, PabiliItem } from '../types';
import { createOrder } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import BarangaySelector from '../components/ui/BarangaySelector';
import Button from '../components/ui/Button';

const { width } = Dimensions.get('window');

interface PabiliItemInput {
  id: string;
  name: string;
  quantity: string;
  estimatedPrice: string;
  notes: string;
}

const createEmptyItem = (): PabiliItemInput => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
  name: '',
  quantity: '1',
  estimatedPrice: '',
  notes: '',
});

export default function PabiliOrderScreen({ navigation, route }: any) {
  const store: Store = route.params?.store;
  const { user } = useAuth();
  
  const [items, setItems] = useState<PabiliItemInput[]>([createEmptyItem()]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [tip, setTip] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const addItem = () => {
    setItems(prev => [...prev, createEmptyItem()]);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof PabiliItemInput, value: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const estimatedTotal = items.reduce((sum, item) => {
    const price = parseFloat(item.estimatedPrice) || 0;
    const qty = parseInt(item.quantity) || 1;
    return sum + price * qty;
  }, 0);

  const serviceFee = 49;
  const tipAmount = parseFloat(tip) || 0;
  const grandTotal = estimatedTotal + serviceFee + tipAmount;

  const handleSubmitOrder = async () => {
    // Validation
    const validItems = items.filter(i => i.name.trim() !== '');
    if (validItems.length === 0) {
      Alert.alert('Missing Items', 'Please add at least one item you want to buy.');
      return;
    }
    if (!dropoff) {
      Alert.alert('Missing Delivery Address', 'Please select your delivery barangay.');
      return;
    }
    if (!user) {
      Alert.alert('Not Logged In', 'Please log in first to place an order.');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsSummary = validItems
        .map(i => `${i.quantity}x ${i.name}${i.notes ? ` (${i.notes})` : ''}`)
        .join(', ');

      const orderId = await createOrder({
        userId: user.uid,
        type: 'pabili',
        pickupLocation: `${store.name} - ${store.address}`,
        dropoffLocation: `${dropoff}, Butuan City`,
        price: grandTotal,
        itemDetails: itemsSummary,
        customerCity: user.location?.city || 'Butuan City',
        customerProvince: user.location?.province || 'Agusan del Norte',
      });

      Alert.alert(
        '🎉 Order Placed!',
        `Your pabili order from ${store.name} has been submitted. A rider will pick it up soon!`,
        [
          {
            text: 'Track Order',
            onPress: () => navigation.navigate('TrackingDetail', { orderId }),
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Store Header with Image */}
      <View style={styles.heroContainer}>
        <Image source={{ uri: store.image }} style={styles.heroImage} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.heroGradient}
        />
        <View style={styles.heroOverlay}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Ionicons name="bag-handle" size={12} color={COLORS.white} />
              <Text style={styles.heroBadgeText}>PABILI ORDER</Text>
            </View>
            <Text style={styles.heroStoreName}>{store.name}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.heroMetaItem}>
                <Ionicons name="location" size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroMetaText}>{store.barangay}</Text>
              </View>
              <View style={styles.heroMetaItem}>
                <Ionicons name="star" size={13} color="#FFB800" />
                <Text style={styles.heroMetaText}>{store.rating}</Text>
              </View>
              <View style={[styles.heroStatusDot, { backgroundColor: store.isOpen ? '#5cfd80' : '#ff6b6b' }]} />
              <Text style={styles.heroMetaText}>{store.isOpen ? 'Open Now' : 'Closed'}</Text>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Instruction Card */}
          <View style={styles.instructionCard}>
            <View style={styles.instructionIcon}>
              <Text style={{ fontSize: 24 }}>📝</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionTitle}>How it works</Text>
              <Text style={styles.instructionDesc}>
                List the items you want, include estimated prices, and our rider will buy them for you from {store.name}!
              </Text>
            </View>
          </View>

          {/* Delivery Location */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>📍 DELIVER TO</Text>
            <BarangaySelector
              label=""
              value={dropoff}
              onSelect={setDropoff}
              placeholder="Select your delivery barangay"
              icon="location"
            />
          </View>

          {/* Items List */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>🛒 YOUR SHOPPING LIST</Text>
              <Text style={styles.itemCount}>{items.filter(i => i.name.trim()).length} item(s)</Text>
            </View>

            {items.map((item, index) => (
              <Animated.View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemNumber}>
                    <Text style={styles.itemNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.itemHeaderTitle}>Item {index + 1}</Text>
                  {items.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      style={styles.removeBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.itemFields}>
                  <View style={styles.itemFieldFull}>
                    <Text style={styles.fieldLabel}>Item Name *</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="e.g., Bear Brand Milk, Safeguard Soap..."
                      placeholderTextColor={`${COLORS.onSurfaceVariant}50`}
                      value={item.name}
                      onChangeText={(v) => updateItem(item.id, 'name', v)}
                    />
                  </View>

                  <View style={styles.itemFieldRow}>
                    <View style={styles.itemFieldHalf}>
                      <Text style={styles.fieldLabel}>Qty</Text>
                      <TextInput
                        style={styles.fieldInput}
                        placeholder="1"
                        placeholderTextColor={`${COLORS.onSurfaceVariant}50`}
                        value={item.quantity}
                        onChangeText={(v) => updateItem(item.id, 'quantity', v)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.itemFieldHalf}>
                      <Text style={styles.fieldLabel}>Est. Price (₱)</Text>
                      <TextInput
                        style={styles.fieldInput}
                        placeholder="0.00"
                        placeholderTextColor={`${COLORS.onSurfaceVariant}50`}
                        value={item.estimatedPrice}
                        onChangeText={(v) => updateItem(item.id, 'estimatedPrice', v)}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>

                  <View style={styles.itemFieldFull}>
                    <Text style={styles.fieldLabel}>Notes (optional)</Text>
                    <TextInput
                      style={[styles.fieldInput, { height: 36 }]}
                      placeholder="e.g., large size, specific brand..."
                      placeholderTextColor={`${COLORS.onSurfaceVariant}50`}
                      value={item.notes}
                      onChangeText={(v) => updateItem(item.id, 'notes', v)}
                    />
                  </View>
                </View>
              </Animated.View>
            ))}

            {/* Add Item Button */}
            <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
              <LinearGradient
                colors={[`${COLORS.primary}10`, `${COLORS.primary}05`]}
                style={styles.addItemBtnGradient}
              >
                <Ionicons name="add-circle" size={22} color={COLORS.primary} />
                <Text style={styles.addItemText}>Add Another Item</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Special Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>💬 SPECIAL INSTRUCTIONS</Text>
            <TextInput
              style={styles.instructionsInput}
              placeholder="e.g. Paki-check kung may stock pa ng Alaska Evap. Kung wala, pwede Birch Tree na lang. Salamat!"
              placeholderTextColor={`${COLORS.onSurfaceVariant}40`}
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Rider Tip */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>💝 TIP YOUR RIDER</Text>
            <View style={styles.tipRow}>
              {['0', '20', '50', '100'].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[styles.tipChip, tip === amount && styles.tipChipActive]}
                  onPress={() => setTip(amount)}
                >
                  <Text style={[styles.tipChipText, tip === amount && styles.tipChipTextActive]}>
                    {amount === '0' ? 'None' : `₱${amount}`}
                  </Text>
                </TouchableOpacity>
              ))}
              <View style={styles.tipCustom}>
                <Text style={styles.tipCurrency}>₱</Text>
                <TextInput
                  style={styles.tipInput}
                  placeholder="Other"
                  placeholderTextColor={`${COLORS.onSurfaceVariant}50`}
                  value={!['0', '20', '50', '100'].includes(tip) ? tip : ''}
                  onChangeText={setTip}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Order Summary */}
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={[COLORS.surfaceLowest, `${COLORS.primary}08`]}
              style={styles.summaryGradient}
            >
              <Text style={styles.summaryTitle}>Order Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Estimated Items Total</Text>
                <Text style={styles.summaryValue}>₱{estimatedTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service Fee</Text>
                <Text style={styles.summaryValue}>₱{serviceFee.toFixed(2)}</Text>
              </View>
              {tipAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Rider Tip</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.tertiary }]}>₱{tipAmount.toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.grandTotalLabel}>Estimated Total</Text>
                <Text style={styles.grandTotalValue}>₱{grandTotal.toFixed(2)}</Text>
              </View>

              <Text style={styles.summaryNote}>
                * Final amount may vary based on actual item prices at the store.
              </Text>
            </LinearGradient>
          </View>

          {/* Submit Button */}
          <View style={styles.submitSection}>
            <Button
              title={isSubmitting ? 'Placing Order...' : `Place Pabili Order — ₱${grandTotal.toFixed(2)}`}
              onPress={handleSubmitOrder}
              loading={isSubmitting}
              style={styles.submitBtn}
            />
            <Text style={styles.submitNote}>
              You'll be able to chat with your rider once they accept
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  // Hero
  heroContainer: {
    height: 220,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: 50,
    paddingBottom: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {},
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 2,
  },
  heroStoreName: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  heroStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  // Content
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: 40,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.secondary}10`,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  instructionIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 2,
  },
  instructionDesc: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
    lineHeight: 17,
  },
  // Sections
  section: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  itemCount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  // Item Card
  itemCard: {
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}20`,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  itemNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },
  itemHeaderTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.error}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemFields: {
    gap: SPACING.sm,
  },
  itemFieldFull: {},
  itemFieldRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  itemFieldHalf: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: `${COLORS.onSurfaceVariant}80`,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  fieldInput: {
    backgroundColor: COLORS.surfaceLow,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  addItemBtn: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: `${COLORS.primary}25`,
    borderStyle: 'dashed',
  },
  addItemBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  addItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // Instructions
  instructionsInput: {
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    fontSize: 14,
    color: COLORS.onSurface,
    fontWeight: '500',
    lineHeight: 20,
    minHeight: 100,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}20`,
  },
  // Tips
  tipRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  tipChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 1.5,
    borderColor: `${COLORS.outlineVariant}30`,
  },
  tipChipActive: {
    backgroundColor: `${COLORS.primary}12`,
    borderColor: COLORS.primary,
  },
  tipChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  tipChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tipCustom: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: `${COLORS.outlineVariant}30`,
    minWidth: 80,
  },
  tipCurrency: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    marginRight: 4,
  },
  tipInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
    paddingVertical: 10,
  },
  // Summary
  summaryCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}15`,
  },
  summaryGradient: {
    padding: SPACING.xl,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: `${COLORS.outlineVariant}25`,
    marginVertical: SPACING.md,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  grandTotalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  summaryNote: {
    fontSize: 11,
    color: `${COLORS.onSurfaceVariant}70`,
    fontStyle: 'italic',
    marginTop: SPACING.md,
    lineHeight: 16,
  },
  // Submit
  submitSection: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  submitBtn: {
    width: '100%',
  },
  submitNote: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
});
