import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { SecurityService } from '../services/securityService';

export default function SetTransactionPinScreen({ navigation }: any) {
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1); // 1 = Enter PIN, 2 = Confirm PIN
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (num: string) => {
    if (step === 1) {
      if (pin.length < 4) {
        const newPin = pin + num;
        setPin(newPin);
        if (newPin.length === 4) {
          setTimeout(() => setStep(2), 300);
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const newPin = confirmPin + num;
        setConfirmPin(newPin);
        if (newPin.length === 4) {
          handleComplete(newPin);
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === 1) setPin(pin.slice(0, -1));
    else setConfirmPin(confirmPin.slice(0, -1));
  };

  const handleComplete = async (finalPin: string) => {
    if (finalPin !== pin) {
      Alert.alert("Mismatch", "The PIN codes do not match. Please try again.");
      setConfirmPin('');
      setStep(1);
      setPin('');
      return;
    }

    setLoading(true);
    try {
      await SecurityService.setTransactionPin(user!.uid, finalPin);
      Alert.alert(
        "Success", 
        "Your Transaction PIN has been activated. You can now use it or Biometrics to authorize payments.",
        [{ text: "Great", onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert("Setup Failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  const currentVal = step === 1 ? pin : confirmPin;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SECURE WALLET</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
         <View style={styles.iconBox}>
            <Ionicons name="shield-checkmark" size={40} color={COLORS.primary} />
         </View>

         <Text style={styles.title}>
            {step === 1 ? "Create Transaction PIN" : "Confirm Your PIN"}
         </Text>
         <Text style={styles.subtitle}>
            {step === 1 
               ? "Set a 4-digit code to authorize your FetchPay transfers and QR payments." 
               : "Enter the same 4-digit code to verify your security setup."}
         </Text>

         <View style={styles.dotsContainer}>
            {[0, 1, 2, 3].map((i) => (
               <View 
                key={i} 
                style={[
                   styles.dot, 
                   currentVal.length > i && styles.dotFilled
                ]} 
               />
            ))}
         </View>

         {loading && <ActivityIndicator color={COLORS.primary} style={{ marginBottom: 20 }} />}
      </View>

      {/* Number Pad */}
      <View style={styles.numpad}>
         {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <TouchableOpacity 
              key={num} 
              style={styles.key} 
              onPress={() => handleKeyPress(num.toString())}
            >
               <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
         ))}
         <View style={styles.key} />
         <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('0')}>
            <Text style={styles.keyText}>0</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.key} onPress={handleDelete}>
            <Ionicons name="backspace-outline" size={24} color={COLORS.onSurface} />
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    color: COLORS.onSurface,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.onSurface,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  dotFilled: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    paddingBottom: 40,
  },
  key: {
    width: '33.33%',
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
});
