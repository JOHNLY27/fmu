import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { deductFromWallet } from '../services/walletService';

const billers = [
  { id: '1', name: 'Butuan Water District', icon: 'water', color: '#2196F3' },
  { id: '2', name: 'ANECO Electricity', icon: 'flash', color: '#FFB300' },
  { id: '3', name: 'PLDT Home', icon: 'globe', color: '#D32F2F' },
  { id: '4', name: 'Globe Postpaid', icon: 'phone-portrait', color: '#1B5E20' },
  { id: '5', name: 'Sky Cable', icon: 'tv', color: '#4527A0' },
];

export default function BillsPaymentScreen({ navigation }: any) {
  const { user } = useAuth();
  const [selectedBiller, setSelectedBiller] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!selectedBiller || !accountNumber || !amount) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }

    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Error', 'Invalid amount.');
      return;
    }

    setLoading(true);
    try {
      await deductFromWallet(user!.uid, value, `Bill Payment: ${selectedBiller.name}`);
      navigation.navigate('Receipt', {
        data: {
          amount: value,
          target: selectedBiller.name,
          type: 'Bills Payment',
          id: `BP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        }
      });
    } catch (error: any) {
      Alert.alert('Payment Failed', error.message || 'Check your balance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bills Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>SELECT BILLER</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.billersList}>
          {billers.map((b) => (
            <TouchableOpacity 
              key={b.id} 
              style={[styles.billerCard, selectedBiller?.id === b.id && styles.selectedBiller]}
              onPress={() => setSelectedBiller(b)}
            >
              <View style={[styles.billerIcon, { backgroundColor: b.color }]}>
                <Ionicons name={b.icon as any} size={24} color={COLORS.white} />
              </View>
              <Text style={styles.billerName}>{b.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedBiller && (
           <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>ACCOUNT NUMBER</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="EX: 1234-5678-90"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>AMOUNT TO PAY (₱)</Text>
                <TextInput 
                  style={[styles.input, { fontSize: 24, fontWeight: '900' }]} 
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
                <Text style={styles.payBtnText}>PAY BILL NOW</Text>
              </TouchableOpacity>
           </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  backBtn: {
    padding: 8,
  },
  content: {
    paddingVertical: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.4)',
    letterSpacing: 2,
    marginLeft: 24,
    marginBottom: 16,
  },
  billersList: {
    paddingLeft: 24,
    marginBottom: 40,
  },
  billerCard: {
    width: 110,
    height: 130,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBiller: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}05`,
  },
  billerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  billerName: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    color: COLORS.onSurface,
  },
  form: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.4)',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  payBtn: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    ...SHADOWS.md,
  },
  payBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});
