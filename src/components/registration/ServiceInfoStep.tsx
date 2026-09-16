import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Bike, Car, Truck, MapPin, ChevronRight, Check } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '@daloa/ui';

const VEHICLE_TYPES = [
  { id: 'Moto', label: 'Moto', icon: Bike },
  { id: 'Vélo', label: 'Vélo', icon: Bike },
  { id: 'Voiture', label: 'Voiture', icon: Car },
  { id: 'Triporteur', label: 'Triporteur', icon: Truck },
];

interface Props {
  vehicleType: string;
  setVehicleType: (val: string) => void;
  vehicleDetails: string;
  setVehicleDetails: (val: string) => void;
  coverageZones: string[];
  onOpenZonesModal: () => void;
  pricingDescription: string;
  setPricingDescription: (val: string) => void;
  termsAccepted: boolean;
  setTermsAccepted: (val: boolean) => void;
}

export const ServiceInfoStep: React.FC<Props> = ({
  vehicleType,
  setVehicleType,
  vehicleDetails,
  setVehicleDetails,
  coverageZones,
  onOpenZonesModal,
  pricingDescription,
  setPricingDescription,
  termsAccepted,
  setTermsAccepted,
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Informations de service</Text>
      <Text style={styles.stepSubtitle}>
        Précisez votre moyen de transport et les quartiers où vous êtes disponible.
      </Text>

      {/* Type de véhicule */}
      <View style={styles.section}>
        <Text style={styles.label}>Type de véhicule *</Text>
        <View style={styles.vehicleGrid}>
          {VEHICLE_TYPES.map((v) => {
            const isSelected = vehicleType === v.id;
            const Icon = v.icon;
            return (
              <TouchableOpacity
                key={v.id}
                onPress={() => setVehicleType(v.id)}
                activeOpacity={0.8}
                style={[styles.vehicleCard, isSelected && styles.vehicleCardActive]}
              >
                <Icon size={24} color={isSelected ? colors.primary.DEFAULT : colors.text.muted} />
                <Text style={[styles.vehicleText, isSelected && styles.vehicleTextActive]}>
                  {v.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Zones de couverture */}
      <View style={styles.section}>
        <Text style={styles.label}>Zones de couverture *</Text>
        <TouchableOpacity
          onPress={onOpenZonesModal}
          activeOpacity={0.8}
          style={styles.zoneSelector}
        >
          <View style={styles.zoneSelectorLeft}>
            <MapPin size={20} color={colors.primary.DEFAULT} />
            <Text
              style={[
                styles.zoneSelectorText,
                coverageZones.length > 0 && styles.zoneSelectorTextActive,
              ]}
            >
              {coverageZones.length > 0
                ? `${coverageZones.length} quartier(s) sélectionné(s)`
                : 'Sélectionner mes quartiers'}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.text.subtle} />
        </TouchableOpacity>

        {coverageZones.length > 0 && (
          <View style={styles.badgeRow}>
            {coverageZones.slice(0, 5).map((zone) => (
              <View key={zone} style={styles.zoneBadge}>
                <Text style={styles.zoneBadgeText}>{zone}</Text>
              </View>
            ))}
            {coverageZones.length > 5 && (
              <View style={styles.zoneBadgeMore}>
                <Text style={styles.zoneBadgeMoreText}>+{coverageZones.length - 5}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Détails véhicule & Tarifs */}
      <View style={styles.section}>
        <Text style={styles.label}>
          Détails véhicule & Tarifs <Text style={styles.optionalText}>(optionnel)</Text>
        </Text>
        <TextInput
          value={vehicleDetails}
          onChangeText={setVehicleDetails}
          placeholder="Ex: Moto Yamaha Rouge, immat. CI-1234"
          placeholderTextColor={colors.text.subtle}
          style={styles.input}
        />
        <TextInput
          value={pricingDescription}
          onChangeText={setPricingDescription}
          placeholder="Ex: 500 FCFA dans le quartier, 1000 FCFA hors-zone..."
          placeholderTextColor={colors.text.subtle}
          multiline
          numberOfLines={2}
          style={[styles.input, styles.multilineInput]}
        />
      </View>

      {/* CGU checkbox */}
      <TouchableOpacity
        onPress={() => setTermsAccepted(!termsAccepted)}
        activeOpacity={0.8}
        style={styles.termsRow}
      >
        <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
          {termsAccepted && <Check size={14} color={colors.text.inverse} strokeWidth={3} />}
        </View>
        <Text style={styles.termsText}>
          J'accepte les{' '}
          <Text
            style={[styles.termsBold, { textDecorationLine: 'underline', color: colors.primary.DEFAULT }]}
            onPress={() => router.push('/legal/terms' as any)}
          >
            Conditions Générales d'Utilisation
          </Text>{' '}
          de DaloaDelivery et m'engage à fournir un service de livraison sérieux et ponctuel.
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing[4],
  },
  stepTitle: {
    fontSize: 20,
    fontFamily: typography.families.bold,
    color: colors.text.DEFAULT,
  },
  stepSubtitle: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: -4,
    lineHeight: 18,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontFamily: typography.families.bold,
    color: colors.text.body,
    marginLeft: 2,
  },
  optionalText: {
    fontFamily: typography.families.normal,
    color: colors.text.subtle,
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vehicleCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.grey[50],
    borderWidth: 1.5,
    borderColor: colors.border.DEFAULT,
  },
  vehicleCardActive: {
    backgroundColor: '#FFF7ED',
    borderColor: colors.primary.DEFAULT,
  },
  vehicleText: {
    fontSize: 14,
    fontFamily: typography.families.semibold,
    color: colors.grey[600],
  },
  vehicleTextActive: {
    color: colors.primary.DEFAULT,
    fontFamily: typography.families.bold,
  },
  zoneSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.grey[50],
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  zoneSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  zoneSelectorText: {
    fontSize: 14,
    fontFamily: typography.families.medium,
    color: colors.text.subtle,
  },
  zoneSelectorTextActive: {
    color: colors.text.DEFAULT,
    fontFamily: typography.families.bold,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  zoneBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  zoneBadgeText: {
    fontSize: 11,
    fontFamily: typography.families.bold,
    color: colors.primary.DEFAULT,
  },
  zoneBadgeMore: {
    backgroundColor: colors.bg.subtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  zoneBadgeMoreText: {
    fontSize: 11,
    fontFamily: typography.families.bold,
    color: colors.grey[600],
  },
  input: {
    backgroundColor: colors.grey[50],
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFF7ED',
    padding: 14,
    borderRadius: radii.lg,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border.strong,
    backgroundColor: colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: colors.grey[600],
    lineHeight: 18,
  },
  termsBold: {
    fontFamily: typography.families.bold,
    color: colors.primary.DEFAULT,
  },
});
