import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Button from '../components/ui/Button';
import BarangaySelector from '../components/ui/BarangaySelector';
import { createOrder } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

export default function ParcelDeliveryScreen({ navigation }: any) {
  const { user } = useAuth();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [itemDetails, setItemDetails] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const handleSendParcel = async () => {
    if (!pickup || !dropoff || !itemDetails) {
      Alert.alert('Missing Details', 'Please fill in pickup, dropoff, and item details.');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'You must be logged in to send a parcel.');
      return;
    }

    setIsBooking(true);
    try {
      const orderId = await createOrder({
        userId: user.uid,
        type: 'parcel',
        pickupLocation: `${pickup}, Butuan City`,
        dropoffLocation: `${dropoff}, Butuan City`,
        price: 15.00, // Flat rate for demo
        itemDetails: itemDetails,
        customerCity: user.location?.city || '',
        customerProvince: user.location?.province || '',
      });
      setIsBooking(false);
      navigation.replace('TrackingDetail', { orderId });
    } catch (e: any) {
      Alert.alert('Error', e.message);
      setIsBooking(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Parcel</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>What are we shipping today?</Text>
        
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Ionicons name="cube-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="What's inside? (e.g. Documents, Keys)"
              value={itemDetails}
              onChangeText={setItemDetails}
              placeholderTextColor={`${COLORS.onSurfaceVariant}80`}
            />
          </View>

          <View style={{ marginTop: SPACING.md }}>
            <BarangaySelector 
              label="PICKUP LOCATION" 
              value={pickup} 
              onSelect={setPickup} 
              placeholder="Select Pickup Barangay" 
              icon="navigate"
            />
          </View>

          <View style={{ marginTop: SPACING.md }}>
            <BarangaySelector 
              label="DROP-OFF LOCATION" 
              value={dropoff} 
              onSelect={setDropoff} 
              placeholder="Where to send?" 
              icon="location"
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Estimated Cost</Text>
          <Text style={styles.priceValue}>₱150.00</Text>
        </View>
        <Button 
          title="Confirm Delivery" 
          onPress={handleSendParcel} 
          size="lg" 
          loading={isBooking}
          fullWidth 
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: SPACING.xxl,
  },
  form: {
    gap: SPACING.lg,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    height: 56,
    ...SHADOWS.sm,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  footer: {
    padding: SPACING.xl,
    paddingBottom: 40,
    backgroundColor: COLORS.surfaceHighest,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    ...SHADOWS.lg,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
});
