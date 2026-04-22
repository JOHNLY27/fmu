import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../services/storageService';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';

export default function VerificationCenterScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const { showToast } = useToast();

  // Requirements status from user data
  const requirements = user?.requirements || {};

  const handleUpload = async (docType: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setLoading(docType);
      try {
        const downloadURL = await uploadImage(
          result.assets[0].uri, 
          `riders/docs/${user?.uid}/${docType}_${Date.now()}`
        );

        const userRef = doc(db, 'users', user?.uid || '');
        await updateDoc(userRef, {
          [`requirements.${docType}`]: downloadURL,
          [`requirements.${docType}Status`]: 'pending',
          updatedAt: new Date().toISOString()
        });
        
        showToast({
          title: 'Document Received',
          message: 'Our compliance team will verify this document within 24 hours.',
          type: 'success'
        });
      } catch (e: any) {
        showToast({
          title: 'Upload Failed',
          message: e.message || 'An error occurred during upload.',
          type: 'error'
        });
      } finally {
        setLoading(null);
      }
    }
  };

  const renderDocRow = (docType: string, label: string, icon: string) => {
    const docUrl = requirements[docType];
    const status = requirements[`${docType}Status`] || 'missing';

    return (
      <View style={styles.docCard}>
         <View style={styles.cardInfo}>
            <View style={[styles.iconBox, { backgroundColor: status === 'approved' ? `${COLORS.tertiary}10` : '#F1F3F5' }]}>
               <Ionicons name={icon as any} size={24} color={status === 'approved' ? COLORS.tertiary : COLORS.onSurfaceVariant} />
            </View>
            <View style={{ flex: 1 }}>
               <Text style={styles.docLabel}>{label}</Text>
               <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: status === 'approved' ? COLORS.tertiary : status === 'pending' ? COLORS.primary : COLORS.onSurfaceVariant }]} />
                  <Text style={[styles.statusText, { color: status === 'approved' ? COLORS.tertiary : status === 'pending' ? COLORS.primary : 'rgba(0,0,0,0.3)' }]}>
                    {status.toUpperCase()}
                  </Text>
               </View>
            </View>
         </View>

         {docUrl ? (
           <View style={styles.previewContainer}>
              <Image 
                source={{ uri: docUrl }} 
                style={styles.previewImg} 
                contentFit="cover"
                transition={500}
              />
              {status !== 'approved' && (
                <TouchableOpacity style={styles.replaceBtn} onPress={() => handleUpload(docType)}>
                  <Text style={styles.replaceText}>REPLACE</Text>
                </TouchableOpacity>
              )}
           </View>
         ) : (
           <TouchableOpacity 
             style={styles.uploadBtn} 
             onPress={() => handleUpload(docType)}
             disabled={loading === docType}
           >
              {loading === docType ? (
                 <Text style={styles.uploadBtnText}>UPLOADING...</Text>
              ) : (
                 <>
                   <Text style={styles.uploadBtnText}>UPLOAD DOCUMENT</Text>
                   <Ionicons name="cloud-upload-outline" size={18} color={COLORS.primary} />
                 </>
              )}
           </TouchableOpacity>
         )}
      </View>
    );
  };

  const approvedCount = Object.keys(requirements).filter(k => k.endsWith('Status') && requirements[k] === 'approved').length;
  const totalRequired = 3;
  const strength = Math.round((approvedCount / totalRequired) * 100);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compliance Center</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Strength Hero */}
        <View style={styles.heroSection}>
           <Text style={styles.strengthLabel}>OPERATIVE ACCREDITATION</Text>
           <Text style={styles.strengthValue}>{strength}% Complete</Text>
           <View style={styles.barContainer}>
              <View style={[styles.barFill, { width: `${strength}%` }]} />
           </View>
           <Text style={styles.strengthNote}>Full accreditation is required for high-value food and parcel missions.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REQUIRED CREDENTIALS</Text>
          {renderDocRow('driversLicense', "DRIVERS LICENSE", 'card-outline')}
          {renderDocRow('vehicleRegistration', "VEHICLE OR/CR", 'bicycle-outline')}
          {renderDocRow('clearance', "CHARACTER CLEARANCE", 'document-text-outline')}
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
  heroSection: {
    backgroundColor: COLORS.onSurface,
    padding: 24,
    borderRadius: 28,
    marginBottom: 32,
    ...SHADOWS.md,
  },
  strengthLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    marginBottom: 8,
  },
  strengthValue: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 16,
  },
  barContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 16,
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.tertiary,
    borderRadius: 3,
  },
  strengthNote: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    lineHeight: 18,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: 'rgba(0,0,0,0.3)',
    marginBottom: 8,
  },
  docCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.sm,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${COLORS.primary}20`,
    borderStyle: 'dashed',
  },
  uploadBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  previewContainer: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  replaceBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  replaceText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.white,
  },
});
