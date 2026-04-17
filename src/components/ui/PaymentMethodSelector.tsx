import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { PaymentMethod } from '../../services/orderService';

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  icon: string;
  color: string;
  description: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  { 
    id: 'cash', 
    label: 'Cash on Delivery', 
    icon: 'cash-outline', 
    color: '#059669', 
    description: 'Pay with physical cash upon arrival'
  },
  { 
    id: 'gcash', 
    label: 'GCash', 
    icon: 'wallet-outline', 
    color: '#1d4ed8', 
    description: 'Pay instantly with GCash e-wallet'
  },
  { 
    id: 'maya', 
    label: 'Maya', 
    icon: 'card-outline', 
    color: '#000000', 
    description: 'Secure digital payment via Maya'
  },
  { 
    id: 'card', 
    label: 'Credit/Debit Card', 
    icon: 'card', 
    color: '#943A24', 
    description: 'Visa, Mastercard, or AMEX'
  },
];

interface Props {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SELECT PAYMENT METHOD</Text>
      
      <View style={styles.optionsList}>
        {PAYMENT_OPTIONS.map((option) => (
          <TouchableOpacity 
            key={option.id}
            style={[
              styles.optionCard,
              selected === option.id && styles.selectedCard
            ]}
            onPress={() => onSelect(option.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: `${option.color}15` }]}>
              <Ionicons name={option.icon as any} size={22} color={option.color} />
            </View>
            
            <View style={styles.info}>
              <Text style={styles.label}>{option.label}</Text>
              <Text style={styles.description}>{option.description}</Text>
            </View>
            
            <View style={styles.radioContainer}>
              <View style={[
                styles.radioOuter,
                selected === option.id && { borderColor: COLORS.primary }
              ]}>
                {selected === option.id && <View style={styles.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.trustBanner}>
        <Ionicons name="shield-checkmark" size={14} color="#059669" />
        <Text style={styles.trustText}>Secure, encrypted transactions powered by Lydblade Pay</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
  },
  title: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.3)',
    letterSpacing: 2.5,
    marginBottom: 20,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  selectedCard: {
    backgroundColor: '#fff',
    borderColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  description: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '500',
    marginTop: 2,
  },
  radioContainer: {
    marginLeft: 10,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  trustText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
  },
});
