import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PhoneCall, Navigation, ScanLine, CheckCircle2, MapPin, Phone, KeyRound } from 'lucide-react-native';
import { colors, radii, spacing, Button, typography } from '@daloa/ui';

interface Props {
  stepNumber: number;
  title: string;
  location: string;
  partnerName: string;
  partnerPhone: string;
  isActive: boolean;
  isDone: boolean;
  onCall: () => void;
  onGps: () => void;
  onScan: () => void;
  scanButtonText: string;
  onEnterOtp?: () => void;
}

export const RunStageCard: React.FC<Props> = ({
  stepNumber,
  title,
  location,
  partnerName,
  partnerPhone,
  isActive,
  isDone,
  onCall,
  onGps,
  onScan,
  scanButtonText,
  onEnterOtp,
}) => {
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
            <MapPin size={11} color={colors.grey[500]} />
            <Text style={styles.stageDistrict} numberOfLines={1}>
              {location}
            </Text>
          </View>
        </View>
        {isDone && <CheckCircle2 size={22} color="#059669" />}
      </View>

      <View style={styles.partnerInfo}>
        <Text style={styles.partnerName}>{partnerName}</Text>
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

      {isActive && (
        <View style={{ marginTop: spacing[3], gap: spacing[2] }}>
          <Button
            title={scanButtonText}
            variant="primary"
            size="lg"
            onPress={onScan}
            leftIcon={<ScanLine size={18} color={colors.text.inverse} />}
            fullWidth
          />
          {onEnterOtp && (
            <Button
              title="Saisir le code secret (OTP)"
              variant="outline"
              size="md"
              onPress={onEnterOtp}
              leftIcon={<KeyRound size={16} color={colors.primary.DEFAULT} />}
              fullWidth
            />
          )}
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
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  stageCardActive: {
    borderColor: colors.primary.DEFAULT,
    borderWidth: 2,
    backgroundColor: '#FFFDFB',
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  stageCardDone: {
    opacity: 0.85,
    backgroundColor: colors.grey[50],
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  stageBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageBadgeActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  stageBadgeText: {
    color: colors.grey[600],
    fontFamily: typography.families.bold,
    fontSize: 14,
  },
  stageBadgeTextActive: {
    color: colors.text.inverse,
  },
  stageTitle: {
    color: colors.text.DEFAULT,
    fontFamily: typography.families.bold,
    fontSize: 15,
  },
  stageDistrict: {
    color: colors.text.muted,
    fontSize: 13,
    marginTop: 2,
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
