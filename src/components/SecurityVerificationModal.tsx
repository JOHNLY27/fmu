import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { SecurityService } from '../services/securityService';

interface SecurityVerificationModalProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
}

export default function SecurityVerificationModal({
  visible,
  onSuccess,
  onCancel,
  title = "SECURITY CHECK",
  subtitle = "Authorize this transaction"
}: SecurityVerificationModalProps) {
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);

  useEffect(() => {
    if (visible) {
      checkBiometrics();
      setPin('');
    }
  }, [visible]);

  const checkBiometrics = async () => {
    const supported = await SecurityService.checkBiometricsSupport();
    setBiometricsAvailable(supported);
    
    // Auto-trigger biometrics if enabled and visible
    if (supported && user?.isBiometricsEnabled) {
      handleBiometrics();
    }
  };

  const handleBiometrics = async () => {
    const success = await SecurityService.authenticateWithBiometrics(subtitle);
    if (success) {
      onSuccess();
    }
  };

  const verifyPin = () => {
    if (pin === user?.transactionPin) {
      onSuccess();
    } else {
      Alert.alert("Invalid PIN", "The code you entered does not match our records.");
      setPin('');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.sheet}>
             <View style={styles.lockIconBox}>
                <Ionicons name="lock-closed" size={32} color={COLORS.primary} />
             </View>

             <Text style={styles.title}>{title}</Text>
             <Text style={styles.subtitle}>{subtitle}</Text>

             <View style={styles.pinContainer}>
                {[1, 2, 3, 4].map((_, i) => (
                   <View 
                    key={i} 
                    style={[
                      styles.pinDot, 
                      pin.length > i && styles.pinDotFilled
                    ]} 
                   />
                ))}
             </View>

             {/* Hidden input to catch keyboard events */}
             <TextInput
               autoFocus
               keyboardType="number-pad"
               maxLength={4}
               value={pin}
               onChangeText={(text) => {
                 setPin(text);
                 if (text.length === 4) {
                    // Logic to verify pin would go here, maybe with a slight delay
                    setTimeout(() => {
                        if (text === user?.transactionPin) {
                            onSuccess();
                        } else {
                            Alert.alert("Invalid PIN", "Transaction aborted due to security mismatch.");
                            setPin('');
                        }
                    }, 500);
                 }
               }}
               style={{ position: 'absolute', opacity: 0 }}
             />

             {biometricsAvailable && (
                <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometrics}>
                   <Ionicons name="finger-print" size={24} color={COLORS.primary} />
                   <Text style={styles.biometricText}>USE BIOMETRICS</Text>
                </TouchableOpacity>
             )}

             <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                <Text style={styles.cancelText}>CANCEL TRANSACTION</Text>
             </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    width: '100%',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    alignItems: 'center',
    paddingBottom: 50,
  },
  lockIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f1419',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 40,
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  pinDotFilled: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    marginBottom: 32,
  },
  biometricText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  cancelBtn: {
    padding: 12,
  },
  cancelText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.error,
    letterSpacing: 1,
    opacity: 0.6,
  },
});
