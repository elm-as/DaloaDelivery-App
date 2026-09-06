import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, Check, MapPin } from 'lucide-react-native';
import { radii, spacing, colors, Button } from '@daloa/ui';
import { DALOA_ZONES } from '../../constants/zones';

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedZones: string[];
  onToggleZone: (zone: string) => void;
}

export const ZonesSelectionModal: React.FC<Props> = ({
  visible,
  onClose,
  selectedZones,
  onToggleZone,
}) => {
  const [search, setSearch] = useState('');

  const filteredZones = DALOA_ZONES.filter((z) =>
    z.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <MapPin size={20} color="#FF6B00" />
            <Text style={styles.headerTitle}>Zones de livraison à Daloa</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <X size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Barre de recherche des quartiers */}
        <View style={styles.searchWrapper}>
          <Search size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un quartier (Lobia, Tazibouo...)"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.counterText}>
          {selectedZones.length} quartier{selectedZones.length > 1 ? 's' : ''} sélectionné{selectedZones.length > 1 ? 's' : ''}
        </Text>

        {/* Liste des quartiers */}
        <ScrollView contentContainerStyle={styles.zonesList}>
          <View style={styles.pillsWrap}>
            {filteredZones.map((zone) => {
              const isSelected = selectedZones.includes(zone);
              return (
                <TouchableOpacity
                  key={zone}
                  onPress={() => onToggleZone(zone)}
                  style={[styles.zonePill, isSelected && styles.zonePillSelected]}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.zonePillText, isSelected && styles.zonePillTextSelected]}>
                    {zone}
                  </Text>
                  {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Bouton de confirmation */}
        <View style={styles.footer}>
          <Button
            title={`Valider (${selectedZones.length} zone${selectedZones.length > 1 ? 's' : ''})`}
            variant="primary"
            size="lg"
            onPress={onClose}
            fullWidth
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: radii.xl,
    paddingHorizontal: 12,
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#111827' },
  counterText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#6B7280',
    marginHorizontal: spacing[4],
    marginTop: 8,
    marginBottom: 4,
  },
  zonesList: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    paddingBottom: 24,
  },
  pillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  zonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  zonePillSelected: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  zonePillText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  zonePillTextSelected: { color: '#FFFFFF', fontWeight: '800' },
  footer: {
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
});
