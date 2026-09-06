import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { colors, radii, spacing, Button, BottomSheet } from '@daloa/ui';

const QUICK_REASONS = [
  'Client absent / injoignable',
  'Vendeur indisponible',
  'Adresse introuvable',
  'Colis endommagé',
  'Panne mécanique / Imprévu',
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  loading: boolean;
}

export const RunIncidentModal: React.FC<Props> = ({
  visible,
  onClose,
  onSubmit,
  loading,
}) => {
  const [reason, setReason] = useState('');

  const handleSelectQuickReason = (tag: string) => {
    if (reason.trim()) {
      setReason(`${reason.trim()} - ${tag}`);
    } else {
      setReason(tag);
    }
  };

  const handleFormSubmit = async () => {
    if (!reason.trim()) return;
    await onSubmit(reason.trim());
    setReason('');
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Signaler un incident de livraison">
      <View style={styles.container}>
        <Text style={styles.instructions}>
          Sélectionnez ou décrivez le motif du blocage. L'équipe support DaloaDelivery sera
          immédiatement notifiée.
        </Text>

        {/* Quick reasons */}
        <View style={styles.tagsRow}>
          {QUICK_REASONS.map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() => handleSelectQuickReason(tag)}
              style={styles.tag}
              activeOpacity={0.75}
            >
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          multiline
          numberOfLines={3}
          placeholder="Précisez les détails de l'incident (optionnel)..."
          placeholderTextColor="#9CA3AF"
          value={reason}
          onChangeText={setReason}
        />

        <View style={{ marginTop: spacing[4] }}>
          <Button
            title="Transmettre l'incident"
            variant="danger"
            size="lg"
            onPress={handleFormSubmit}
            loading={loading}
            disabled={!reason.trim() || loading}
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
  },
  instructions: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: spacing[2],
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing[4],
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: radii.lg,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 75,
    textAlignVertical: 'top',
  },
});
