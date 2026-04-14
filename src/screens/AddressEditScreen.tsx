import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import BarangaySelector from '../components/ui/BarangaySelector';
import Button from '../components/ui/Button';

export default function AddressEditScreen({ navigation }: any) {
  const { user } = useAuth();
  
  // They are limited to Butuan City currently, so only Barangay is editable.
  const [barangay, setBarangay] = useState(user?.location?.barangay || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!barangay) {
      Alert.alert("Missing Address", "Please select a barangay.");
      return;
    }
    if (!user?.uid) return;

    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        "location.barangay": barangay,
        "location.city": "Butuan City",
        "location.province": "Agusan del Norte"
      });
      
      Alert.alert("Success", "Your home address has been updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
      // Note: AuthContext might need to be refreshed, but onAuthStateChanged will handle it next load.
      // We ideally want them to fetch the profile changes, but for now this sets it in DB!
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not save your address. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Home Address</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
          <Text style={styles.infoText}>
            FetchMeUp is currently available exclusively in Butuan City.
          </Text>
        </View>

        <Text style={styles.label}>Province</Text>
        <View style={styles.readOnlyInput}>
          <Text style={styles.readOnlyText}>Agusan del Norte</Text>
        </View>

        <Text style={styles.label}>City/Municipality</Text>
        <View style={styles.readOnlyInput}>
          <Text style={styles.readOnlyText}>Butuan City</Text>
        </View>

        <Text style={[styles.label, { marginTop: 10 }]}>Select Barangay</Text>
        <BarangaySelector
          label=""
          value={barangay}
          onSelect={setBarangay}
          placeholder="Choose your default barangay..."
          icon="home"
        />

        <Button 
          title="Save Address" 
          onPress={handleSave} 
          loading={isSaving}
          fullWidth
          style={{ marginTop: 30 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.outlineVariant}20`,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLow,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.primary}12`,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: 10,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.onSurface,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    marginBottom: 6,
    marginLeft: 4,
  },
  readOnlyInput: {
    backgroundColor: COLORS.surfaceLow,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}10`,
  },
  readOnlyText: {
    fontSize: 15,
    color: `${COLORS.onSurface}80`,
    fontWeight: '600',
  },
});
