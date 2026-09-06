import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Linking, Alert } from 'react-native';
import { Bike, CheckCircle2, FileText, XCircle } from 'lucide-react-native';
import { colors, Button } from '@daloa/ui';
import { REJECTION_REASONS, styles } from './adminStyles';

export interface DriverRow {
  id: string;
  name: string | null;
  phone: string | null;
  photo_url: string | null;
  cni_url: string | null;
  vehicle_type: string | null;
  verification_status: string | null;
  is_verified: boolean | null;
  created_at: string;
}

interface Props {
  driver: DriverRow;
  acting: string | null;
  rejectingId: string | null;
  rejectReason: string;
  onSetRejectingId: (id: string | null) => void;
  onSetRejectReason: (reason: string) => void;
  onVerify: (driver: DriverRow, approved: boolean, reason?: string) => Promise<void>;
}

export const DriverVerificationCard: React.FC<Props> = ({
  driver: d,
  acting,
  rejectingId,
  rejectReason,
  onSetRejectingId,
  onSetRejectReason,
  onVerify,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={styles.cardIcon}>
          <Bike size={16} color={colors.status.infoDark} />
        </View>
        <View style={styles.cardHeadText}>
          <Text style={styles.cardTitle}>{d.name || 'Sans nom'}</Text>
          <Text style={styles.cardMeta}>
            {d.phone || 'Téléphone manquant'}
            {d.vehicle_type ? ` · ${d.vehicle_type}` : ''}
          </Text>
        </View>
      </View>

      {d.cni_url ? (
        <TouchableOpacity
          style={styles.docLink}
          onPress={() => Linking.openURL(d.cni_url as string)}
        >
          <FileText size={14} color={colors.status.infoDark} />
          <Text style={styles.docLinkText}>Ouvrir la pièce d’identité</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.warnText}>Aucun document transmis.</Text>
      )}

      {rejectingId === d.id ? (
        <View style={styles.rejectBox}>
          <Text style={styles.rejectLabel}>Motif du refus</Text>
          {REJECTION_REASONS.map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => onSetRejectReason(r)}
              style={[styles.reasonChip, rejectReason === r && styles.reasonChipOn]}
            >
              <Text
                style={[
                  styles.reasonChipText,
                  rejectReason === r && styles.reasonChipTextOn,
                ]}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
          <TextInput
            style={styles.input}
            placeholder="Autre motif…"
            placeholderTextColor={colors.text.subtle}
            value={REJECTION_REASONS.includes(rejectReason) ? '' : rejectReason}
            onChangeText={onSetRejectReason}
            multiline
          />
          <View style={styles.actionRow}>
            <Button
              title="Annuler"
              variant="secondary"
              onPress={() => {
                onSetRejectingId(null);
                onSetRejectReason('');
              }}
              style={styles.flexBtn}
            />
            <Button
              title="Confirmer le refus"
              variant="danger"
              loading={acting === d.id}
              onPress={() => {
                if (!rejectReason.trim()) {
                  Alert.alert('Motif requis', 'Indiquez la raison du refus.');
                  return;
                }
                onVerify(d, false, rejectReason.trim());
              }}
              style={styles.flexBtn}
            />
          </View>
        </View>
      ) : (
        <View style={styles.actionRow}>
          <Button
            title="Refuser"
            variant="secondary"
            onPress={() => {
              onSetRejectingId(d.id);
              onSetRejectReason('');
            }}
            leftIcon={<XCircle size={15} color={colors.status.error} />}
            style={styles.flexBtn}
          />
          <Button
            title="Vérifier"
            variant="delivery"
            loading={acting === d.id}
            onPress={() => onVerify(d, true)}
            leftIcon={<CheckCircle2 size={15} color={colors.text.inverse} />}
            style={styles.flexBtn}
          />
        </View>
      )}
    </View>
  );
};
