import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

export const BUTUAN_BARANGAYS = [
  'Agao', 'Agusan Pequeño', 'Ambago', 'Amparo', 'Ampayon', 'Anticala', 'Antongalon', 
  'Baan KM 3', 'Baan Riverside', 'Bading', 'Bancasi', 'Banza', 'Baobaoan', 'Basag', 
  'Bayanihan', 'Bilay', 'Bitan-agan', 'Bit-os', 'Bobon', 'Bonbon', 'Bugabus', 
  'Buhangin', 'Cabcabon', 'Camayahan', 'Dagohoy', 'Dankias', 'De Oro', 
  'Don Francisco', 'Doongan', 'Dulag', 'DumALAGAN', 'Florida', 'Golden Ribbon', 
  'Holy Redeemer', 'Humabon', 'Kinamlutan', 'Lapu-lapu', 'Lema', 'Leon Kilat', 
  'Libertad', 'Limaha', 'Los Angeles', 'Lumbocan', 'Maguinda', 'Mahay', 'Mahogany', 
  'Manding', 'Maon', 'Masao', 'Maug', 'New Society Village', 'Nong-nong', 'Obrero', 
  'Ong Yiu', 'Pagatpatan', 'Pangabugan', 'Pianing', 'Pinamanculan', 'Pino', 
  'Rajah Soliman', 'Salamanca', 'San Ignacio', 'San Mateo', 'San Vicente', 
  'Sikatuna', 'Silongan', 'Sumilihon', 'Tagabaca', 'Taguibo', 'Taligaman', 
  'Tandang Sora', 'Tiniwisan', 'Tungkisan', 'Urduja', 'Villa Kananga'
].sort();

interface Props {
  value: string;
  onSelect: (barangay: string) => void;
  label: string;
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function BarangaySelector({ value, onSelect, label, placeholder = 'Select Barangay', icon }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = BUTUAN_BARANGAYS.filter(b => b.toLowerCase().includes(search.toLowerCase()));

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={[styles.inputRow, value ? styles.inputRowActive : null]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.inputValue, !value && styles.placeholder]}>
          {value ? `${value}, Butuan City` : placeholder}
        </Text>
        <Ionicons name={icon || "chevron-down"} size={16} color={`${COLORS.onSurfaceVariant}80`} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Barangay</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color={COLORS.onSurfaceVariant} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {filtered.map(b => (
                <TouchableOpacity 
                  key={b} 
                  style={styles.bItem}
                  onPress={() => {
                    onSelect(b);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.bText}>{b}</Text>
                  {value === b && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: `${COLORS.onSurfaceVariant}80`,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: 'space-between'
  },
  inputRowActive: {
    borderBottomWidth: 2,
    borderBottomColor: `${COLORS.primary}60`,
  },
  inputValue: {
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '500',
    flex: 1,
  },
  placeholder: {
    color: `${COLORS.onSurfaceVariant}60`,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    height: '80%',
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: SPACING.lg,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  bItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLow,
  },
  bText: {
    fontSize: 15,
    color: COLORS.onSurface,
  }
});
