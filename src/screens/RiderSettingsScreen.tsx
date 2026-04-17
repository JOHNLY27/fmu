import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../services/storageService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function RiderSettingsScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const initialSection = route.params?.section || 'personal';
  
  const [activeTab, setActiveTab] = useState(initialSection);
  const [loading, setLoading] = useState(false);

  // Personal Info State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [image, setImage] = useState<string | null>(user?.photoURL || null);

  // Vehicle Info State
  const [vehicleModel, setVehicleModel] = useState(user?.vehicle?.model || '');
  const [plateNumber, setPlateNumber] = useState(user?.vehicle?.plateNumber || '');
  const [vehicleType, setVehicleType] = useState(user?.vehicle?.type || 'motorcycle');

  // Payout Info State
  const [payoutMethod, setPayoutMethod] = useState(user?.payout?.method || 'gcash');
  const [payoutAccount, setPayoutAccount] = useState(user?.payout?.account || '');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let finalPhotoUrl = image;
      if (image && !image.startsWith('http')) {
        finalPhotoUrl = await uploadImage(image, `riders/avatars/${user?.uid}_${Date.now()}`);
      }

      const userRef = doc(db, 'users', user?.uid || '');
      await updateDoc(userRef, {
        name,
        phone,
        photoURL: finalPhotoUrl,
        vehicle: { model: vehicleModel, plateNumber: plateNumber, type: vehicleType },
        payout: { method: payoutMethod, account: payoutAccount },
        updatedAt: new Date().toISOString(),
      });
      Alert.alert('System Synchronized', 'Your operative profile has been updated.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Update Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <View style={styles.sectionBody}>
             <View style={styles.avatarHub}>
                <TouchableOpacity style={styles.avatarCircle} onPress={pickImage}>
                   {image ? (
                     <Image source={{ uri: image }} style={styles.avatarImg} />
                   ) : (
                     <View style={styles.avatarPlaceholder}><Text style={styles.placeholderChar}>{name.charAt(0)}</Text></View>
                   )}
                   <View style={styles.editBadge}><Ionicons name="camera" size={14} color={COLORS.white} /></View>
                </TouchableOpacity>
                <Text style={styles.avatarTip}>Rider Mission Photo</Text>
             </View>
             <Input label="FULL NAME" value={name} onChangeText={setName} variant="filled" />
             <Input label="CONTACT NUMBER" value={phone} onChangeText={setPhone} keyboardType="phone-pad" variant="filled" />
          </View>
        );
      case 'vehicle':
        return (
          <View style={styles.sectionBody}>
             <View style={styles.infoBox}>
                <Ionicons name="bicycle" size={24} color={COLORS.primary} />
                <Text style={styles.infoText}>Ensure vehicle data matches your registration documents.</Text>
             </View>
             <Input label="VEHICLE MODEL / COLOR" value={vehicleModel} onChangeText={setVehicleModel} placeholder="e.g. Honda Click 125 (Black)" variant="filled" />
             <Input label="PLATE NUMBER" value={plateNumber} onChangeText={setPlateNumber} placeholder="e.g. 123ABC" variant="filled" />
          </View>
        );
      case 'payout':
        return (
          <View style={styles.sectionBody}>
             <Text style={styles.label}>SELECT PAYOUT METHOD</Text>
             <View style={styles.methodToggle}>
                {['gcash', 'maya'].map(m => (
                  <TouchableOpacity 
                    key={m} 
                    style={[styles.methodBtn, payoutMethod === m && styles.activeMethod]}
                    onPress={() => setPayoutMethod(m)}
                  >
                    <Text style={[styles.methodText, payoutMethod === m && styles.activeMethodText]}>{m.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
             </View>
             <Input 
               label={`${payoutMethod.toUpperCase()} NUMBER`} 
               value={payoutAccount} 
               onChangeText={setPayoutAccount} 
               placeholder="09XX XXX XXXX"
               keyboardType="phone-pad"
               variant="filled" 
             />
          </View>
        );
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Operative Hub</Text>
      </View>

      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {['personal', 'vehicle', 'payout'].map(t => (
            <TouchableOpacity 
              key={t} 
              style={[styles.tab, activeTab === t && styles.activeTab]}
              onPress={() => setActiveTab(t)}
            >
              <Text style={[styles.tabText, activeTab === t && styles.activeTabText]}>
                {t === 'personal' ? 'IDENTITY' : t === 'vehicle' ? 'FLEET' : 'FINANCE'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
           {renderSection()}
           <View style={{ marginTop: 40 }}>
              <Button title="SYNC CHANGES" onPress={handleSave} loading={loading} variant="primary" size="xl" fullWidth />
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
  tabBar: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  activeTab: {
    backgroundColor: `${COLORS.primary}10`,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.35)',
    letterSpacing: 1,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  scrollContent: {
    padding: 24,
  },
  sectionBody: {
    gap: 20,
  },
  avatarHub: {
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
    borderWidth: 3,
    borderColor: COLORS.white,
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderChar: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.onSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarTip: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.3)',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: `${COLORS.primary}05`,
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    lineHeight: 18,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: 'rgba(0,0,0,0.3)',
    marginBottom: 10,
  },
  methodToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  methodBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F1F3F5',
  },
  activeMethod: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}05`,
  },
  methodText: {
    fontSize: 13,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.3)',
    letterSpacing: 0.5,
  },
  activeMethodText: {
    color: COLORS.primary,
  },
});
