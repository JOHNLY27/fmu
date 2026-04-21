import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

export default function PrivacySecurityScreen({ navigation }: any) {
  const { user } = useAuth();
  const [dataSharing, setDataSharing] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Permanent Erasure?',
      'This will permanently delete your mission history and stored preferences. This action cannot be undone.',
      [
        { text: 'Keep My Data', style: 'cancel' },
        { 
          text: 'Erase Everything', 
          style: 'destructive',
          onPress: () => Alert.alert('Request Submitted', 'Our data team will process your deletion request within 24 hours.')
        }
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
        <Text style={styles.headerTitle}>Privacy & Security</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT PROTECTION</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ChangePassword')}>
              <View style={styles.iconBox}><Ionicons name="key-outline" size={20} color={COLORS.primary} /></View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                 <Text style={styles.rowTitle}>Account Password</Text>
                 <Text style={styles.rowSub}>Update your login credentials</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(0,0,0,0.1)" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('SetTransactionPin')}>
              <View style={styles.iconBox}><Ionicons name="shield-checkmark-outline" size={20} color="#10B981" /></View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                 <Text style={styles.rowTitle}>Transaction PIN</Text>
                 <Text style={styles.rowSub}>{user?.transactionPin ? 'PIN is Active • Change PIN' : 'Unset • Setup PIN Now'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(0,0,0,0.1)" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BIOMETRIC OVERRIDE</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconBox}><Ionicons name="finger-print-outline" size={20} color={COLORS.primary} /></View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                 <Text style={styles.rowTitle}>Authorize with Face/Touch</Text>
                 <Text style={styles.rowSub}>Speed up payments using biometrics</Text>
              </View>
              <Switch 
                value={user?.isBiometricsEnabled || false} 
                trackColor={{ false: '#f1f3f5', true: COLORS.primary }} 
                onValueChange={async (val) => {
                  if (!user?.transactionPin && val) {
                    Alert.alert("Setup Required", "Please set a Transaction PIN first before enabling biometrics.");
                    return;
                  }
                  // Service call would go here
                }}
              />
            </View>
          </View>
        </View>


        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA TELEMETRY</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                 <Text style={styles.rowTitle}>Personalization Cookies</Text>
                 <Text style={styles.rowSub}>Allow us to suggest stores based on your fetches</Text>
              </View>
              <Switch value={dataSharing} onValueChange={setDataSharing} trackColor={{ false: '#f1f3f5', true: COLORS.primary }} />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                 <Text style={styles.rowTitle}>Anonymous Analytics</Text>
                 <Text style={styles.rowSub}>Help us improve Butuan's delivery infrastructure</Text>
              </View>
              <Switch value={analytics} onValueChange={setAnalytics} trackColor={{ false: '#f1f3f5', true: COLORS.primary }} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DANGER ZONE</Text>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
             <Ionicons name="trash-outline" size={20} color={COLORS.error} />
             <Text style={styles.deleteText}>Request Account Deletion</Text>
          </TouchableOpacity>
          <Text style={styles.guideText}>
            Privacy is a core pillar of FetchMeUp. Your data is encrypted and handled according to PH Data Privacy Act standards.
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  rowSub: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '600',
    marginTop: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F8F9FA',
    marginVertical: 16,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.error,
    letterSpacing: 0.5,
  },
  guideText: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(0,0,0,0.3)',
    marginTop: 20,
    lineHeight: 18,
    fontWeight: '600',
    paddingHorizontal: 10,
  },
});
