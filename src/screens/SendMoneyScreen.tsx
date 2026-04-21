import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { sendMoneyToUser } from '../services/walletService';
import SecurityVerificationModal from '../components/SecurityVerificationModal';


export default function SendMoneyScreen({ navigation, route }: any) {
  const { prefilledEmail } = route.params || {};
  const { user } = useAuth();
  const [email, setEmail] = useState(prefilledEmail || '');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);


  React.useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail]);


  const handleSend = () => {
    if (!email || !amount) {
      Alert.alert('Incomplete', 'Please provide recipient email and amount.');
      return;
    }

    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    // Require PIN/Biometrics if set
    if (user?.transactionPin) {
      setShowSecurityModal(true);
    } else {
      // For first time users without a PIN, prompt to set one or proceed
      Alert.alert(
        "Security Alert", 
        "You haven't set a Transaction PIN yet. For your safety, we recommend setting one in Security Settings.",
        [
          { text: "Set PIN Now", onPress: () => navigation.navigate('PrivacySecurity') },
          { text: "Skip & Pay", onPress: () => performTransfer() }
        ]
      );
    }
  };

  const performTransfer = async () => {
    setShowSecurityModal(false);
    const value = parseFloat(amount);
    setLoading(true);
    try {
      await sendMoneyToUser(user!.uid, email, value);
      navigation.navigate('Receipt', {
        data: {
          amount: value,
          target: email,
          type: 'P2P Transfer',
          id: `FP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        }
      });
    } catch (error: any) {
      Alert.alert('Transfer Failed', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Money</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>RECIPIENT EMAIL</Text>
          <View style={styles.inputWrapper}>
             <Ionicons name="mail-outline" size={20} color="rgba(0,0,0,0.3)" />
             <TextInput 
                style={styles.input}
                placeholder="Enter their FetchMeUp email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
             />
             <TouchableOpacity 
                style={styles.scanMiniBtn}
                onPress={() => navigation.navigate('ScanQR')}
              >
                <Ionicons name="qr-code-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>AMOUNT (₱)</Text>
          <View style={styles.inputWrapper}>
             <Text style={styles.currency}>₱</Text>
             <TextInput 
                style={[styles.input, styles.amountInput]}
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
             />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.sendBtn, loading && styles.disabledBtn]} 
          onPress={handleSend}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color={COLORS.white} />
          ) : (
             <>
               <Text style={styles.sendBtnText}>PROCEED TRANSFER</Text>
               <Ionicons name="send" size={18} color={COLORS.white} />
             </>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
           <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
           <Text style={styles.infoText}>
              Payments are secure and instant. Double check the recipient email before sending.
           </Text>
        </View>
      </View>

      <SecurityVerificationModal 
        visible={showSecurityModal}
        onSuccess={performTransfer}
        onCancel={() => setShowSecurityModal(false)}
        title="AUTHORIZE TRANSFER"
        subtitle={`Confirm ₱${amount} transfer to ${email}`}
      />
    </KeyboardAvoidingView>

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
    padding: 24,
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.4)',
    letterSpacing: 2,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  currency: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    marginRight: 4,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '900',
  },
  sendBtn: {
    backgroundColor: COLORS.onSurface,
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
    ...SHADOWS.md,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  sendBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.primary}10`,
    padding: 16,
    borderRadius: 16,
    marginTop: 40,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    lineHeight: 18,
  },
  scanMiniBtn: {
    padding: 10,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 12,
  },
});

