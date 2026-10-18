import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radii, AppText, typography } from '@daloa/ui';

interface ProfileStatsRowProps {
  rating?: number | null;
  totalReviews?: number | null;
  deliveredCount: number;
  zonesCount: number;
}

export function ProfileStatsRow({
  rating,
  totalReviews,
  deliveredCount,
  zonesCount,
}: ProfileStatsRowProps) {
  const ratingText =
    totalReviews && totalReviews > 0 && rating != null ? Number(rating).toFixed(1) : '-';
  const ratingLabel = totalReviews && totalReviews > 0 ? 'Note globale' : 'Nouveau';

  return (
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <AppText variant="title" color={colors.primary.DEFAULT} style={styles.statValue}>
          {ratingText}
        </AppText>
        <AppText variant="caption" style={styles.statLabel}>
          {ratingLabel}
        </AppText>
      </View>
      <View style={styles.statCard}>
        <AppText variant="title" color={colors.text.DEFAULT} style={styles.statValue}>
          {deliveredCount}
        </AppText>
        <AppText variant="caption" style={styles.statLabel}>
          Livraisons
        </AppText>
      </View>
      <View style={styles.statCard}>
        <AppText variant="title" color={colors.status.successDark} style={styles.statValue}>
          {zonesCount}
        </AppText>
        <AppText variant="caption" style={styles.statLabel}>
          Quartiers
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: typography.families.black,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 11,
    fontFamily: typography.families.medium,
    color: colors.text.muted,
    marginTop: 2,
  },
});
