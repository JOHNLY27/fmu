import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../services/storageService';

const { width } = Dimensions.get('window');

export default function RiderPortalScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [province, setProvince] = useState('Agusan del Norte');
  const [city, setCity] = useState('Butuan City');
  const [barangay, setBarangay] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [licenseImage, setLicenseImage] = useState<string | null>(null);
  const [plateImage, setPlateImage] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Load saved rider email if rememberMe was previously active
  useEffect(() => {
    const loadSavedRiderEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('saved_rider_email');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (e) {
        console.log('Error loading saved rider email:', e);
      }
    };
    loadSavedRiderEmail();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const pickImage = async (type: 'license' | 'plate') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'license') setLicenseImage(result.assets[0].uri);
      else setPlateImage(result.assets[0].uri);
    }
  };

  const handleAuth = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      if (activeTab === 'login') {
        await signIn(cleanEmail, password);
        
        if (rememberMe) {
          await AsyncStorage.setItem('saved_rider_email', cleanEmail);
        } else {
          await AsyncStorage.removeItem('saved_rider_email');
        }
      } else {
        if (!name || !province || !city || !licenseNumber || !vehiclePlateNumber || !vehicleModel) {
          Alert.alert('Error', 'Please provide your name, location, and all vehicle requirements.');
          setLoading(false);
          return;
        }

        if (!licenseImage || !plateImage) {
          Alert.alert('Documents Missing', 'Please upload images of your Driver\'s License and Vehicle Plate.');
          setLoading(false);
          return;
        }

        let licenseUrl = '';
        let plateUrl = '';

        try {
          const timestamp = Date.now();
          licenseUrl = await uploadImage(licenseImage, `riders/docs/${cleanEmail}_license_${timestamp}`);
          plateUrl = await uploadImage(plateImage, `riders/docs/${cleanEmail}_plate_${timestamp}`);
        } catch (uploadError) {
          Alert.alert('Upload Failed', 'There was an error uploading your documents. Please try again.');
          setLoading(false);
          return;
        }

        await signUp(
          name, cleanEmail, password, 'rider', 
          { country: 'Philippines', province, city, barangay },
          { licenseNumber, vehiclePlateNumber, vehicleModel, licenseImage: licenseUrl, plateImage: plateUrl }
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Side Color Bar (Decorative) */}
      <View style={styles.accentBar} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        <View style={styles.heroSection}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.heroContent}>
             <Text style={styles.heroLabel}>RIDER PORTAL</Text>
             <Text style={styles.heroTitle}>Move the{'\n'}<Text style={styles.heroHighlight}>Economy.</Text></Text>
             <Text style={styles.heroDesc}>Join the network of professional couriers delivering excellence across the city.</Text>
          </View>
        </View>

        <Animated.View style={[styles.mainCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.tabWrapper}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'login' && styles.activeTab]}
              onPress={() => setActiveTab('login')}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Portal Access</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
              onPress={() => setActiveTab('signup')}
            >
              <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>Apply Now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContent}>
            <Text style={styles.formHeader}>{activeTab === 'login' ? 'Authentication' : 'Partner Application'}</Text>
            
            <View style={styles.fields}>
              {activeTab === 'signup' && (
                <Input label="FULL NAME" placeholder="Marcus J." value={name} onChangeText={setName} variant="filled" />
              )}
              <Input label="EMAIL ADDRESS" placeholder="rider@fetchmeup.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" variant="filled" />
              <Input label="PASSWORD" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry variant="filled" />

              {activeTab === 'signup' && (
                <View style={styles.nestedFields}>
                  <Text style={styles.sectionLabel}>OPERATIONAL AREA</Text>
                  <View style={styles.row}>
                    <Input label="PROVINCE" placeholder="Agusan del Norte" value={province} onChangeText={setProvince} variant="filled" />
                    <Input label="CITY" placeholder="Butuan" value={city} onChangeText={setCity} variant="filled" />
                  </View>
                  <Input label="BARANGAY" placeholder="e.g. Libertad" value={barangay} onChangeText={setBarangay} variant="filled" />

                  <View style={styles.divider} />
                  <Text style={styles.sectionLabel}>VEHICLE & LICENSE</Text>
                  <Input label="LICENSE NUMBER" placeholder="N01-XX-XXXXXX" value={licenseNumber} onChangeText={setLicenseNumber} variant="filled" />
                  <View style={styles.row}>
                    <Input label="PLATE NUMBER" placeholder="ABC 1234" value={vehiclePlateNumber} onChangeText={setVehiclePlateNumber} variant="filled" />
                    <Input label="MODEL" placeholder="Honda Click" value={vehicleModel} onChangeText={setVehicleModel} variant="filled" />
                  </View>

                  <Text style={styles.sectionLabel}>SECURITY DOCUMENTS</Text>
                  <View style={styles.uploadRow}>
                    <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('license')}>
                      {licenseImage ? (
                        <Image source={{ uri: licenseImage }} style={styles.uploadedImg} />
                      ) : (
                        <View style={styles.placeholderBox}>
                          <Ionicons name="card" size={24} color={COLORS.secondary} />
                          <Text style={styles.placeholderLabel}>License</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('plate')}>
                      {plateImage ? (
                        <Image source={{ uri: plateImage }} style={styles.uploadedImg} />
                      ) : (
                        <View style={styles.placeholderBox}>
                          <Ionicons name="camera" size={24} color={COLORS.secondary} />
                          <Text style={styles.placeholderLabel}>Plate</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {activeTab === 'login' && (
                <View style={styles.rememberRow}>
                  <TouchableOpacity style={styles.rememberBtn} onPress={() => setRememberMe(!rememberMe)}>
                    <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                       {rememberMe && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
                    </View>
                    <Text style={styles.rememberText}>Secure Remember me</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ marginTop: 24 }}>
                <Button
                  title={activeTab === 'login' ? "Secure Access" : "Submit Application"}
                  onPress={handleAuth}
                  size="xl"
                  fullWidth
                  loading={loading}
                  variant={activeTab === 'login' ? 'primary' : 'secondary'}
                  icon={<Ionicons name="shield-checkmark" size={22} color={COLORS.white} />}
                />
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419', // Dark professional bg
  },
  accentBar: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: COLORS.secondary,
    opacity: 0.3,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    height: 380,
    paddingTop: 60,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 60,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroContent: {
    gap: 8,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 4,
    color: COLORS.secondary,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  heroHighlight: {
    color: COLORS.secondary,
    fontStyle: 'italic',
  },
  heroDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 22,
    maxWidth: '85%',
  },
  mainCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -40,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 50,
    ...SHADOWS.lg,
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: RADIUS.full,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(15,20,25,0.4)',
  },
  activeTabText: {
    color: COLORS.secondary,
  },
  formContent: {
    gap: 24,
  },
  formHeader: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f1419',
    letterSpacing: -0.5,
  },
  fields: {
    gap: 20,
  },
  nestedFields: {
    gap: 16,
    marginTop: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
    color: COLORS.secondary,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 10,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadBox: {
    flex: 1,
    height: 100,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceLow,
    borderWidth: 2,
    borderColor: 'rgba(73,83,172,0.1)',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadedImg: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  placeholderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  rememberRow: {
    marginTop: 8,
  },
  rememberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(73,83,172,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  rememberText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
});
