import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function BannedScreen() {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="warning" size={60} color={COLORS.error} />
        </View>

        <Text style={styles.title}>Account Restricted</Text>
        <Text style={styles.sub}>
          This account has been permanently restricted for violating the FetchMeUp community guidelines or platform terms of service.
        </Text>

        <View style={styles.reasonCard}>
           <Text style={styles.reasonLabel}>REASON FOR RESTRICTION</Text>
           <Text style={styles.reasonText}>Violation of Platform Safety Protocols</Text>
        </View>

        <View style={styles.footer}>
           <Text style={styles.footerText}>
             If you believe this is a clerical error, please contact our Legal & Compliance team in Butuan City.
           </Text>
        </View>

        <TouchableOpacity style={styles.exitBtn} onPress={signOut}>
           <Text style={styles.exitText}>TERMINATE SESSION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
  },
  content: {
    padding: 40,
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.error}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f1419',
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    color: 'rgba(15,20,25,0.6)',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
    fontWeight: '500',
  },
  reasonCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 24,
    marginTop: 40,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.1)',
  },
  reasonLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: COLORS.error,
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f1419',
  },
  footer: {
    marginTop: 40,
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.35)',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },
  exitBtn: {
    marginTop: 60,
    width: '100%',
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: '#0f1419',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  exitText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
