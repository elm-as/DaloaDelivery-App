import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { colors, radii, spacing, Button, BottomSheet, typography } from '@daloa/ui';
import { COD_REFUSAL_REASONS } from '@daloa/api';
import { CodRefusalReason } from '@daloa/types';
import { AlertTriangle, PhoneOff, Banknote, XCircle, MapPinOff } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: CodRefusalReason, notes?: string) => Promise<void>;
  loading: boolean;
}

export const CodRefusalModal: React.FC<Props> = ({
  visible,
  onClose,
  onSubmit,
  loading,
}) => {
  const [selectedReason, setSelectedReason] = useState<CodRefusalReason>('buyer_unreachable');
  const [notes, setNotes] = useState('');

  const handleFormSubmit = async () => {
    await onSubmit(selectedReason, notes.trim() || undefined);
    setNotes('');
  };

  const getIcon = (id: CodRefusalReason) => {
    switch (id) {
      case 'buyer_unreachable':
        return <PhoneOff size={16} color={colors.status.errorDark} />;
      case 'buyer_refused_no_money':
        return <Banknote size={16} color="#B45309" />;
      case 'buyer_refused_changed_mind':
        return <XCircle size={16} color={colors.status.errorDark} />;
      case 'buyer_fake_location':
        return <MapPinOff size={16} color="#B45309" />;
      default:
        return <AlertTriangle size={16} color={colors.text.muted} />;
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Signaler un refus / Client injoignable">
      <View style={styles.container}>
        <View style={styles.warningBanner}>
          <AlertTriangle size={16} color="#B45309" />
          <Text style={styles.instructions}>
            Cette déclaration clôture votre course sans pénalité pour vous et met à jour le dossier
            Anti-Lapin de l'acheteur.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Motif du non-aboutissement :</Text>

        <View style={styles.reasonsList}>
          {COD_REFUSAL_REASONS.map((r) => {
            const isSelected = selectedReason === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                onPress={() => setSelectedReason(r.id)}
                style={[styles.reasonCard, isSelected && styles.reasonCardSelected]}
                activeOpacity={0.75}
              >
                <View style={styles.reasonHeader}>
                  {getIcon(r.id)}
                  <Text style={[styles.reasonLabel, isSelected && styles.reasonLabelSelected]}>
                    {r.label}
                  </Text>
                </View>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TextInput
          style={styles.input}
          multiline
          numberOfLines={2}
          placeholder="Détails supplémentaires (ex : '3 appels restés sans réponse à 14h20')..."
          placeholderTextColor={colors.text.subtle}
          value={notes}
          onChangeText={setNotes}
        />

        <View style={{ marginTop: spacing[3] }}>
          <Button
            title="Confirmer l'incident & Libérer la course"
            variant="danger"
            size="lg"
            onPress={handleFormSubmit}
            loading={loading}
            disabled={loading}
            fullWidth
          />
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing[4],
    gap: spacing[2],
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: spacing[3],
    borderRadius: radii.lg,
    marginBottom: spacing[1],
  },
  instructions: {
    flex: 1,
    fontSize: 12.5,
    color: '#92400E',
    lineHeight: 17,
    fontFamily: typography.families.medium,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: typography.families.semibold,
    color: colors.text.DEFAULT,
  },
  reasonsList: {
    gap: 6,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[3],
    backgroundColor: colors.bg.subtle,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border.DEFAULT,
  },
  reasonCardSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: colors.status.errorDark,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  reasonLabel: {
    fontSize: 13,
    color: colors.text.body,
    flex: 1,
    fontFamily: typography.families.medium,
  },
  reasonLabelSelected: {
    color: colors.status.errorDark,
    fontFamily: typography.families.bold,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.border.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.status.errorDark,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.status.errorDark,
  },
  input: {
    backgroundColor: colors.bg.surface,
    borderRadius: radii.lg,
    padding: 12,
    fontSize: 13,
    color: colors.text.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    minHeight: 60,
    textAlignVertical: 'top',
    marginTop: 4,
  },
});
