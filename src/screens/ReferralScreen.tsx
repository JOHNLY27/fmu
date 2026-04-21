import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Share,
  Clipboard,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { referralService } from '../services/referralService';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function ReferralScreen({ navigation }: any) {
  const { user } = useAuth();
  const [inputCode, setInputCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'invite' | 'missions'>('invite');

  // Handle Legacy Users (Auto-generate if missing)
  React.useEffect(() => {
    const patchLegacyCode = async () => {
      if (user?.uid && !user.referralCode) {
        const shortCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        const cleanName = (user.name || 'AGENT').split(' ')[0].replace(/[^a-zA-Z]/g, '').toUpperCase();
        const newCode = `${cleanName}${shortCode}`;
        
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            referralCode: newCode
          });
          console.log('Legacy referral code settled:', newCode);
        } catch (e) {
          console.log('Sync error:', e);
        }
      }
    };
    patchLegacyCode();
  }, [user?.uid, user?.referralCode]);

  const myCode = user?.referralCode || 'SYNCING...';


  const handleClaim = async () => {
    if (!inputCode.trim()) return;
    setIsSubmitting(true);
    try {
      const referrerName = await referralService.claimReferral(user!.uid, inputCode);
      Alert.alert(
        'Protocol Verified',
        `You have been recruited by ${referrerName}. Your ₱50 bonus will be credited after your first mission completion.`,
        [{ text: 'Acknowledged' }]
      );
      setInputCode('');
    } catch (e: any) {
      Alert.alert('Identification Error', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on FetchMeUp! Use my mission code ${myCode} to get ₱50 off your first task. Download now: [URL]`,
      });
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(myCode);
    Alert.alert('Agent Code Copied', 'Your referral sequence is ready for dispatch.');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Cinematic Header */}
      <LinearGradient colors={['#0f1419', '#2563eb']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Network Growth</Text>
        
        <View style={styles.heroContent}>
           <View style={styles.moneyBadge}>
              <Text style={styles.moneyText}>₱50 + ₱50</Text>
           </View>
           <Text style={styles.heroTitle}>Expand the Network</Text>
           <Text style={styles.heroSubtitle}>Recruit new users and both of you will receive ₱50 credits upon their first mission completion.</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Referral Card */}
        <View style={styles.card}>
           <Text style={styles.cardLabel}>YOUR AGENT CODE</Text>
           <TouchableOpacity style={styles.codeContainer} onPress={copyToClipboard}>
              <Text style={styles.codeText}>{myCode}</Text>
              <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
           </TouchableOpacity>
           <Text style={styles.codeHint}>Tap to copy and share with your recruits</Text>
           
           <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <LinearGradient 
                colors={[COLORS.primary, '#1d4ed8']} 
                style={styles.gradientBtn}
                start={{x:0, y:0}}
                end={{x:1, y:0}}
              >
                 <Ionicons name="share-social" size={20} color="#fff" style={{ marginRight: 8 }} />
                 <Text style={styles.shareBtnText}>Dispatch Code</Text>
              </LinearGradient>
           </TouchableOpacity>
        </View>

        {/* Claim Section */}
        {(!user?.referredBy && user?.role === 'user') && (
          <View style={[styles.card, { marginTop: 24 }]}>
             <Text style={styles.cardLabel}>RECRUITED BY A FRIEND?</Text>
             <Text style={styles.claimSubtitle}>Enter their code here to activate your ₱50 newcomer bonus.</Text>
             
             <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="ENTER AGENT CODE"
                  placeholderTextColor="rgba(0,0,0,0.3)"
                  autoCapitalize="characters"
                  value={inputCode}
                  onChangeText={setInputCode}
                />
                <TouchableOpacity 
                  style={[styles.claimBtn, !inputCode && { opacity: 0.5 }]} 
                  onPress={handleClaim}
                  disabled={!inputCode || isSubmitting}
                >
                   {isSubmitting ? (
                     <Text style={styles.claimBtnText}>Verifying...</Text>
                   ) : (
                     <Text style={styles.claimBtnText}>Verify</Text>
                   )}
                </TouchableOpacity>
             </View>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
           <Text style={styles.infoTitle}>Operational Pipeline</Text>
           
           <View style={styles.stepRow}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
              <View style={styles.stepInfo}>
                 <Text style={styles.stepTitle}>Share your Code</Text>
                 <Text style={styles.stepDesc}>Send your unique agent code to friends who haven't joined the FetchMeUp network.</Text>
              </View>
           </View>

           <View style={styles.stepRow}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
              <View style={styles.stepInfo}>
                 <Text style={styles.stepTitle}>Friend joins Discord</Text>
                 <Text style={styles.stepDesc}>When they signup or enter your code in this screen, the link is established.</Text>
              </View>
           </View>

           <View style={styles.stepRow}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
              <View style={styles.stepInfo}>
                 <Text style={styles.stepTitle}>Mission Accomplished</Text>
                 <Text style={styles.stepDesc}>Once your friend completes their first 'Pabili' or Delivery mission, both of you get ₱50.</Text>
              </View>
           </View>
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
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  heroContent: {
    alignItems: 'center',
  },
  moneyBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  moneyText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    ...SHADOWS.md,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.3)',
    letterSpacing: 2,
    marginBottom: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
  },
  codeText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: 4,
  },
  codeHint: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '700',
  },
  shareBtn: {
    marginTop: 24,
    borderRadius: 18,
    overflow: 'hidden',
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  shareBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },
  claimSubtitle: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  claimBtn: {
    backgroundColor: COLORS.onSurface,
    borderRadius: 16,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  claimBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 13,
  },
  infoSection: {
    marginTop: 40,
    paddingHorizontal: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.onSurface,
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 14,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.4)',
    lineHeight: 18,
    fontWeight: '600',
  },
});
