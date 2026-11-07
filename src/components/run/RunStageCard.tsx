import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PhoneCall, Navigation, ScanLine, CheckCircle2, MapPin, Phone, KeyRound } from 'lucide-react-native';
import { colors, radii, spacing, Button, typography } from '@daloa/ui';

interface Props {
  stepNumber: number;
  title: string;
  location: string;
  district?: string | null;
  partnerName: string;
  partnerPhone: string;
  isActive: boolean;
  isDone: boolean;
  onCall: () => void;
  onGps: () => void;
  onScan: () => void;
  scanButtonText: string;
  onEnterOtp?: () => void;
  /** Remplace « Saisir le code » et « Scanner » (ex. course payée en espèces : pas de code acheteur). */
  primaryAction?: { title: string; onPress: () => void };
  secondaryAction?: { title: string; onPress: () => void; variant?: 'outline' | 'danger' | 'ghost' };
  reliabilityBadge?: React.ReactNode;
}

export const RunStageCard: React.FC<Props> = ({
  stepNumber,
  title,
  location,
  district,
  partnerName,
  partnerPhone,
  isActive,
  isDone,
  onCall,
  onGps,
  onScan,
  scanButtonText,
  onEnterOtp,
  primaryAction,
  secondaryAction,
  reliabilityBadge,
}) => {
  const isPickupStep = stepNumber === 1;

  return (
    <View
      style={[
        styles.stageCard,
        isActive && styles.stageCardActive,
        isDone && styles.stageCardDone,
      ]}
    >
      <View style={styles.stageHeader}>
        <View style={[styles.stageBadge, isActive && styles.stageBadgeActive]}>
          <Text style={[styles.stageBadgeText, isActive && styles.stageBadgeTextActive]}>
            {stepNumber}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.stageTitle}>{title}</Text>
          {district && (
            <View style={[styles.districtBadge, isPickupStep ? styles.districtBadgePickup : styles.districtBadgeDropoff]}>
              <Text style={[styles.districtBadgeText, isPickupStep ? styles.districtBadgeTextPickup : styles.districtBadgeTextDropoff]}>
                📍 Quartier {district}
              </Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
            <MapPin size={11} color={colors.grey[500]} />
            <Text style={styles.stageDistrict} numberOfLines={2}>
              {location}
            </Text>
          </View>
        </View>
        {isDone && <CheckCircle2 size={22} color="#059669" />}
      </View>

      <View style={styles.partnerInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
          <Text style={styles.partnerName}>{partnerName}</Text>
          {reliabilityBadge}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <Phone size={11} color={colors.grey[600]} />
          <Text style={styles.partnerPhone}>{partnerPhone}</Text>
        </View>
      </View>

      {isActive && (
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={onCall} style={styles.actionBtnOutline} activeOpacity={0.8}>
            <PhoneCall size={15} color="#059669" />
            <Text style={[styles.actionBtnOutlineText, { color: '#059669' }]}>Appeler</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onGps} style={styles.actionBtnOutline} activeOpacity={0.8}>
            <Navigation size={15} color={colors.primary.DEFAULT} />
            <Text style={[styles.actionBtnOutlineText, { color: colors.primary.DEFAULT }]}>GPS</Text>
          </TouchableOpacity>
        </View>
      )}

      {isActive && primaryAction && (
        <View style={{ marginTop: spacing[3], gap: spacing[2] }}>
          <Button
            title={primaryAction.title}
            variant="primary"
            size="lg"
            onPress={primaryAction.onPress}
            fullWidth
          />
          {secondaryAction && (
            <Button
              title={secondaryAction.title}
              variant={secondaryAction.variant || 'outline'}
              size="md"
              onPress={secondaryAction.onPress}
              fullWidth
            />
          )}
        </View>
      )}

      {isActive && !primaryAction && (
        <View style={{ marginTop: spacing[3], gap: spacing[2] }}>
          {onEnterOtp && (
            <Button
              title={isPickupStep ? 'Entrer le code Vendeur (6 chiffres)' : 'Entrer le code Client (6 chiffres)'}
              variant="primary"
              size="lg"
              onPress={onEnterOtp}
              leftIcon={<KeyRound size={18} color={colors.text.inverse} />}
              fullWidth
            />
          )}
          <Button
            title={scanButtonText}
            variant="outline"
            size="md"
            onPress={onScan}
            leftIcon={<ScanLine size={16} color={colors.primary.DEFAULT} />}
            fullWidth
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  stageCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: radii.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    marginBottom: spacing[3],
  },
  stageCardActive: {
    borderColor: colors.primary.DEFAULT,
    borderWidth: 2,
  },
  stageCardDone: {
    opacity: 0.75,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  stageBadge: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.grey[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageBadgeActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  stageBadgeText: {
    color: colors.grey[700],
    fontFamily: typography.families.bold,
    fontSize: 13,
  },
  stageBadgeTextActive: {
    color: '#fff',
  },
  stageTitle: {
    color: colors.text.DEFAULT,
    fontFamily: typography.families.bold,
    fontSize: 14,
  },
  districtBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 3,
    marginBottom: 2,
  },
  districtBadgePickup: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  districtBadgeDropoff: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  districtBadgeText: {
    fontSize: 11,
    fontFamily: typography.families.bold,
  },
  districtBadgeTextPickup: {
    color: '#9A3412',
  },
  districtBadgeTextDropoff: {
    color: '#065F46',
  },
  stageDistrict: {
    color: colors.grey[600],
    fontSize: 12,
    flex: 1,
  },
  partnerInfo: {
    backgroundColor: colors.bg.subtle,
    borderRadius: radii.lg,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  partnerName: {
    color: colors.text.DEFAULT,
    fontFamily: typography.families.semibold,
    fontSize: 14,
  },
  partnerPhone: {
    color: colors.grey[600],
    fontSize: 13,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: 4,
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radii.lg,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  actionBtnOutlineText: {
    fontFamily: typography.families.semibold,
    fontSize: 13,
  },
});
