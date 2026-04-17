import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function RiderApprovalWaitingScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={[COLORS.onSurface, '#0f1419']}
        style={styles.hero}
      >
        <TouchableOpacity style={styles.logoutTop} onPress={signOut}>
          <Ionicons name="log-out-outline" size={24} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>

        <View style={styles.illustration}>
          <View style={styles.pulseContainer}>
            <View style={styles.pulseInner} />
            <Ionicons name="shield-checkmark" size={60} color={COLORS.primary} />
          </View>
        </View>

        <Text style={styles.title}>Application Under Review</Text>
        <Text style={styles.name}>Welcome to the Fleet, {user?.name}</Text>
        <Text style={styles.sub}>
          Your operative profile is currently being vetted by the Butuan City Admin team. 
          We verify all credentials to maintain a high-trust logistics network.
        </Text>
      </LinearGradient>

      <View style={styles.bottomSection}>
        <View style={styles.timeline}>
          <View style={styles.timeStep}>
            <View style={[styles.timeDot, styles.dotDone]} />
            <Text style={styles.timeTitle}>Enrollment Complete</Text>
            <Text style={styles.timeDesc}>Identity and credentials logged</Text>
          </View>
          <View style={styles.line} />
          <View style={styles.timeStep}>
            <View style={[styles.timeDot, styles.dotPing]} />
            <Text style={[styles.timeTitle, styles.textActive]}>Admin Vetting</Text>
            <Text style={styles.timeDesc}>Current phase: Verification</Text>
          </View>
          <View style={styles.line} />
          <View style={styles.timeStep}>
            <View style={styles.timeDot} />
            <Text style={styles.timeTitle}>Clearance Issued</Text>
            <Text style={styles.timeDesc}>Access to Mission Pool granted</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
           <Ionicons name="information-circle-outline" size={20} color={COLORS.onSurface} />
           <Text style={styles.infoText}>
             Expected review time: 12-24 hours. You will be notified once clearance is issued.
           </Text>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={() => { /* Navigation will auto-trigger on status change */ }}>
           <Text style={styles.refreshText}>CHECK FOR CLEARANCE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  hero: {
    height: '50%',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logoutTop: {
    position: 'absolute',
    top: 60,
    right: 30,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    marginBottom: 30,
  },
  pulseContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseInner: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(73,83,172,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginTop: 8,
    textAlign: 'center',
  },
  sub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 20,
    maxWidth: '85%',
  },
  bottomSection: {
    padding: 40,
    flex: 1,
  },
  timeline: {
    gap: 0,
  },
  timeStep: {
    paddingLeft: 30,
    position: 'relative',
    paddingBottom: 24,
  },
  timeDot: {
    position: 'absolute',
    left: -4,
    top: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
    zIndex: 2,
  },
  dotDone: {
    backgroundColor: COLORS.tertiary,
  },
  dotPing: {
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: '#E2E8F0',
  },
  line: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 0,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginLeft: -1,
  },
  timeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.3)',
  },
  textActive: {
    color: COLORS.onSurface,
  },
  timeDesc: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 2,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(73,83,172,0.05)',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.onSurface,
    fontWeight: '600',
    lineHeight: 18,
  },
  refreshBtn: {
    marginTop: 'auto',
    backgroundColor: COLORS.onSurface,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  refreshText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
