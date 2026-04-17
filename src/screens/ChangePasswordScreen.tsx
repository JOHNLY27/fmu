import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function ChangePasswordScreen({ navigation }: any) {
  const { changePassword } = useAuth();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      Alert.alert('Incomplete Mission', 'All password fields are required for security verification.');
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert('Verification Failed', 'The new passwords do not match. Please re-enter.');
      return;
    }
    if (newPass.length < 6) {
      Alert.alert('Weak Security', 'New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await (changePassword as any)(currentPass, newPass);
      Alert.alert('Security Updated', 'Your access password has been successfully modified.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Access Denied', 'Authentication failed. Please verify your current password.');
      console.log('Password Update Error:', e);
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
        <Text style={styles.headerTitle}>Update Password</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>IDENTITY CHALLENGE</Text>
            <View style={styles.card}>
               <Input 
                 label="CURRENT PASSWORD" 
                 placeholder="••••••••" 
                 secureTextEntry 
                 value={currentPass}
                 onChangeText={setCurrentPass}
                 autoCapitalize="none"
                 variant="filled"
               />
               <Text style={styles.guideText}>Verify your existing access key to authorize changes.</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NEW ACCESS KEY</Text>
            <View style={styles.card}>
               <Input 
                 label="NEW PASSWORD" 
                 placeholder="••••••••" 
                 secureTextEntry 
                 value={newPass}
                 onChangeText={setNewPass}
                 autoCapitalize="none"
                 variant="filled"
               />
               <Input 
                 label="CONFIRM PASSWORD" 
                 placeholder="••••••••" 
                 secureTextEntry 
                 value={confirmPass}
                 onChangeText={setConfirmPass}
                 autoCapitalize="none"
                 variant="filled"
               />
            </View>
          </View>

          <View style={{ marginTop: 24 }}>
            <Button 
               title={loading ? "VERIFYING IDENTITY..." : "UPDATE ACCESS KEY"} 
               onPress={handleUpdate}
               loading={loading}
               variant="primary"
               size="xl"
               fullWidth
            />
          </View>

          <View style={styles.securitySeal}>
             <Ionicons name="shield-checkmark" size={16} color="rgba(0,0,0,0.2)" />
             <Text style={styles.sealText}>Identity data points are encrypted end-to-end.</Text>
          </View>

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
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: 'rgba(0,0,0,0.3)',
    marginBottom: 16,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.sm,
    gap: 16,
  },
  guideText: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.35)',
    fontWeight: '600',
    lineHeight: 18,
  },
  securitySeal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
  },
  sealText: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.25)',
    fontWeight: '700',
  },
});
