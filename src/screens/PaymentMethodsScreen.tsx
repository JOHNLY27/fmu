import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function PaymentMethodsScreen({ navigation }: any) {
  const { user } = useAuth();
  
  const [methods, setMethods] = useState([
    { id: '1', type: 'wallet', name: 'FetchPay Wallet', sub: 'Primary Method', icon: 'wallet', active: true },
    { id: '2', type: 'cash', name: 'Cash on Delivery', sub: 'Standard Checkout', icon: 'cash', active: false },
    { id: '3', type: 'card', name: 'Visa Primary', sub: '•••• 4412', icon: 'card', active: false },
  ]);

  const handleSetDefault = (id: string) => {
    setMethods(methods.map(m => ({ ...m, active: m.id === id })));
    const method = methods.find(m => m.id === id);
    Alert.alert("Default Updated", `${method?.name} is now your preferred payment method.`);
  };

  const handleAddMethod = () => {
    Alert.alert(
      "Add Payment Method",
      "Select a secure provider to link your account.",
      [
        { text: "GCash", onPress: () => Alert.alert("Coming Soon", "GCash integration is currently in beta.") },
        { text: "Credit/Debit Card", onPress: () => Alert.alert("Coming Soon", "PayMaya/Card gateway integration in progress.") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Ecosystem</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>YOUR WALLETS & ASSETS</Text>
        
        {methods.map((method) => (
          <TouchableOpacity 
            key={method.id} 
            style={[styles.methodCard, method.active && styles.activeCard]}
            onPress={() => handleSetDefault(method.id)}
          >
            <View style={[styles.iconBox, { backgroundColor: method.active ? `${COLORS.primary}10` : '#F8F9FA' }]}>
               <Ionicons 
                name={method.icon as any} 
                size={22} 
                color={method.active ? COLORS.primary : COLORS.onSurface} 
               />
            </View>
            <View style={styles.methodInfo}>
               <Text style={[styles.methodName, method.active && styles.activeText]}>{method.name}</Text>
               <Text style={styles.methodSub}>{method.sub}</Text>
            </View>
            {method.active ? (
               <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            ) : (
               <View style={styles.circle} />
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={handleAddMethod}>
           <View style={styles.addIcon}>
              <Ionicons name="add" size={24} color={COLORS.primary} />
           </View>
           <Text style={styles.addText}>Add New Payment Method</Text>
        </TouchableOpacity>

        <View style={styles.securityBox}>
           <Ionicons name="shield-checkmark" size={20} color={COLORS.secondary} />
           <Text style={styles.securityText}>
              All transactions are encrypted and secured by FetchMeUp's PCI-compliant infrastructure.
           </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  backBtn: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: 'rgba(0,0,0,0.3)',
    marginBottom: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    ...SHADOWS.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeCard: {
    borderColor: `${COLORS.primary}20`,
    backgroundColor: COLORS.white,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 16,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  activeText: {
    color: COLORS.primary,
  },
  methodSub: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 2,
    fontWeight: '600',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F1F3F5',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
    padding: 4,
  },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  securityBox: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.secondary}08`,
    padding: 20,
    borderRadius: 20,
    marginTop: 40,
    gap: 12,
    alignItems: 'center',
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '600',
    lineHeight: 18,
  },
});
