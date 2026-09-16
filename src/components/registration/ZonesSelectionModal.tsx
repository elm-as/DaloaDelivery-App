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
import { radii, spacing, colors, Button, typography } from '@daloa/ui';
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
            <MapPin size={20} color={colors.primary.DEFAULT} />
            <Text style={styles.headerTitle}>Zones de livraison à Daloa</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <X size={20} color={colors.text.muted} />
          </TouchableOpacity>
        </View>

        {/* Barre de recherche des quartiers */}
        <View style={styles.searchWrapper}>
          <Search size={16} color={colors.text.subtle} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un quartier (Lobia, Tazibouo...)"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={colors.text.subtle}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color={colors.text.subtle} />
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
                  {isSelected && <Check size={14} color={colors.text.inverse} strokeWidth={3} />}
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
  container: { flex: 1, backgroundColor: colors.bg.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.subtle,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 16, fontFamily: typography.families.black, color: colors.text.DEFAULT },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bg.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.grey[50],
    borderRadius: radii.xl,
    paddingHorizontal: 12,
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.text.DEFAULT },
  counterText: {
    fontSize: 11.5,
    fontFamily: typography.families.bold,
    color: colors.text.muted,
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
    backgroundColor: colors.bg.subtle,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  zonePillSelected: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  zonePillText: { fontSize: 12, fontFamily: typography.families.semibold, color: colors.text.body },
  zonePillTextSelected: { color: colors.text.inverse, fontFamily: typography.families.extrabold },
  footer: {
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.bg.subtle,
    backgroundColor: colors.bg.surface,
  },
});
