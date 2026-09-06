import React from 'react';
import { View, Text } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { colors, Button } from '@daloa/ui';
import { styles } from './adminStyles';

export interface DisputeRow {
  id: string;
  order_id: string;
  status: string;
  dispute_reason: string | null;
  disputed_at: string | null;
  delivery_person_id: string | null;
  dropoff_location: string | null;
}

export type DisputeAction = 'deliver' | 'cancel' | 'refund_complete' | 'refund_partial';

interface Props {
  dispute: DisputeRow;
  acting: string | null;
  onConfirmDispute: (dispute: DisputeRow, action: DisputeAction) => void;
}

export const DisputeResolutionCard: React.FC<Props> = ({
  dispute: a,
  acting,
  onConfirmDispute,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={[styles.cardIcon, styles.cardIconWarn]}>
          <AlertTriangle size={16} color={colors.status.warningDark} />
        </View>
        <View style={styles.cardHeadText}>
          <Text style={styles.cardTitle}>
            {a.dispute_reason === 'too_many_otp_attempts'
              ? 'Trop de tentatives de code'
              : a.dispute_reason || 'Litige signalé'}
          </Text>
          <Text style={styles.cardMeta}>
            {a.dropoff_location || 'Adresse non renseignée'}
          </Text>
        </View>
      </View>

      <Text style={styles.hint}>
        « Livrer » paie le vendeur et le livreur. « Rembourser » rend l’argent
        à l’acheteur. Ces décisions déplacent de l’argent réel.
      </Text>

      <View style={styles.actionRow}>
        <Button
          title="Livrer"
          variant="delivery"
          loading={acting === a.id}
          onPress={() => onConfirmDispute(a, 'deliver')}
          style={styles.flexBtn}
        />
        <Button
          title="Annuler"
          variant="secondary"
          onPress={() => onConfirmDispute(a, 'cancel')}
          style={styles.flexBtn}
        />
      </View>
      <View style={styles.actionRow}>
        <Button
          title="Remb. total"
          variant="danger"
          onPress={() => onConfirmDispute(a, 'refund_complete')}
          style={styles.flexBtn}
        />
        <Button
          title="Remb. partiel"
          variant="danger"
          onPress={() => onConfirmDispute(a, 'refund_partial')}
          style={styles.flexBtn}
        />
      </View>
    </View>
  );
};
