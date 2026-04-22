import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import BarangaySelector from '../components/ui/BarangaySelector';

import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../services/storageService';
import { useToast } from '../context/ToastContext';

export default function ProfileEditScreen({ navigation }: any) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [barangay, setBarangay] = useState(user?.location?.barangay || '');
  const [image, setImage] = useState<string | null>(user?.photoURL || null);
  const [notifs, setNotifs] = useState(true);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast({
        title: 'Action Blocked',
        message: 'Camera roll access needed to personalize your profile.',
        type: 'warning'
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast({
        title: 'Validation Error',
        message: 'Full name is required for mission verification.',
        type: 'warning'
      });
      return;
    }
    setLoading(true);
    try {
      let finalPhotoUrl = image;
      
      if (image && !image.startsWith('http')) {
        finalPhotoUrl = await uploadImage(image, `users/avatars/${user?.uid}_${Date.now()}`);
      }

      // 1. Update Database Identity
      const userRef = doc(db, 'users', user?.uid || '');
      await updateDoc(userRef, {
        name: name.trim(),
        phone: phone.trim(),
        photoURL: finalPhotoUrl,
        'location.barangay': barangay,
        updatedAt: new Date().toISOString()
      });

      // 2. Update Auth Identity for persistent syncing
      const { auth } = await import('../config/firebase');
      const { updateProfile } = await import('firebase/auth');
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name.trim(),
          photoURL: finalPhotoUrl || undefined
        });
      }

      showToast({
        title: 'Update Successful',
        message: 'Your identity profile has been updated.',
        type: 'success'
      });

      navigation.goBack();
    } catch (e: any) {
      showToast({
        title: 'Update Failed',
        message: e.message || 'An error occurred during sync.',
        type: 'error'
      });
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
        <Text style={styles.headerTitle}>Personalization</Text>
      </View>

      <KeyboardAwareScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={50}
        keyboardShouldPersistTaps="handled"
      >
          
          {/* Avatar Hub */}
          <View style={styles.avatarHub}>
              <TouchableOpacity style={styles.avatarCircle} onPress={pickImage} activeOpacity={0.8}>
                 {image ? (
                   <Image 
                     source={{ uri: image }} 
                     style={styles.avatarImg} 
                     contentFit="cover"
                     transition={300}
                   />
                 ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.placeholderChar}>{name.charAt(0).toUpperCase() || '?'}</Text>
                  </View>
                )}
                <View style={styles.editBadge}>
                   <Ionicons name="camera" size={16} color={COLORS.white} />
                </View>
             </TouchableOpacity>
             <Text style={styles.avatarTip}>Tap to scout new profile photo</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>IDENTITY SPECIFICATION</Text>
            <View style={styles.card}>
              <Input 
                label="FULL NAME" 
                value={name} 
                onChangeText={setName} 
                placeholder="Enter your real name"
                variant="filled"
              />
              <Input 
                label="CONTACT NUMBER" 
                value={phone} 
                onChangeText={setPhone} 
                placeholder="09XX XXX XXXX"
                keyboardType="phone-pad"
                variant="filled"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PRIMARY DELIVERY ZONE</Text>
            <View style={styles.card}>
              <BarangaySelector 
                value={barangay} 
                onSelect={setBarangay} 
                label="DEFAULT BARANGAY" 
                placeholder="Set your home area"
              />
              <Text style={styles.guideText}>Setting a default zone speeds up your mission executions.</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>APP PREFERENCES</Text>
            <View style={styles.card}>
              <View style={styles.preferenceRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prefLabel}>Mission Notifications</Text>
                  <Text style={styles.prefSub}>Real-time alerts for fetch status</Text>
                </View>
                <Switch 
                  value={notifs} 
                  onValueChange={setNotifs}
                  trackColor={{ false: '#f1f3f5', true: COLORS.primary }}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.preferenceRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prefLabel}>Precision Telemetry</Text>
                  <Text style={styles.prefSub}>Share location only during active missions</Text>
                </View>
                <Switch value={true} disabled trackColor={{ false: '#f1f3f5', true: COLORS.primary }} />
              </View>
            </View>
          </View>

          <View style={{ marginTop: 24 }}>
            <Button 
              title={loading ? "SAVING IDENTITY..." : "SAVE PREFERENCES"} 
              onPress={handleSave} 
              loading={loading}
              variant="primary"
              size="xl"
              fullWidth
            />
          </View>
        </KeyboardAwareScrollView>
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
  avatarHub: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
    borderWidth: 4,
    borderColor: COLORS.white,
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderChar: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.white,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.onSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarTip: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.35)',
    marginTop: 12,
    letterSpacing: 0.5,
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
    lineHeight: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prefLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  prefSub: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginVertical: 4,
  },
});
