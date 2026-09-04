import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TrendingUp, CheckCircle2, Star } from 'lucide-react-native';
import { colors, radii, spacing, AppText, AppPressable } from '@daloa/ui';
import { formatFCFA } from '@daloa/utils';

interface DriverStatsRowProps {
  earningsToday: number;
  completedRunsToday: number;
  rating?: number;
  onPressEarnings?: () => void;
}

export const DriverStatsRow: React.FC<DriverStatsRowProps> = ({
  earningsToday,
  completedRunsToday,
  rating = 5.0,
  onPressEarnings,
}) => {
  return (
    <View style={styles.container}>
      <AppPressable
        haptic="light"
        onPress={onPressEarnings}
        style={[styles.kpiCard, styles.earningsCard]}
        accessibilityLabel="Détails des gains du jour"
      >
        <View style={[styles.iconWrap, { backgroundColor: '#FFF4E6' }]}>
          <TrendingUp size={16} color="#E65100" />
        </View>
        <AppText variant="caption" color={colors.text.muted} style={styles.kpiLabel}>
          Gains du jour
        </AppText>
        <AppText variant="title" color="#E65100" style={styles.tabularNumbers}>
          {formatFCFA(earningsToday)}
        </AppText>
      </AppPressable>

      <View style={styles.kpiCard}>
        <View style={[styles.iconWrap, { backgroundColor: '#ECFDF5' }]}>
          <CheckCircle2 size={16} color="#059669" />
        </View>
        <AppText variant="caption" color={colors.text.muted} style={styles.kpiLabel}>
          Livrées
        </AppText>
        <AppText variant="title" color="#059669" style={styles.tabularNumbers}>
          {completedRunsToday}
        </AppText>
      </View>

      <View style={styles.kpiCard}>
        <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
          <Star size={16} color="#D97706" />
        </View>
        <AppText variant="caption" color={colors.text.muted} style={styles.kpiLabel}>
          Note
        </AppText>
        <AppText variant="title" color="#D97706" style={styles.tabularNumbers}>
          {rating.toFixed(1)}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing[2],
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    marginBottom: spacing[4],
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  earningsCard: {
    borderColor: '#FFE0B2',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  tabularNumbers: {
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
    fontSize: 15,
  },
});
