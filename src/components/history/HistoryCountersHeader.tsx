import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { colors, radii, typography } from '@daloa/ui';
import { Haptics } from '@daloa/utils';

interface HistoryCountersHeaderProps {
  activeCount: number;
  historyCount: number;
  onRefresh: () => void;
}

export function HistoryCountersHeader({
  activeCount,
  historyCount,
  onRefresh,
}: HistoryCountersHeaderProps) {
  const handlePressRefresh = () => {
    Haptics.lightImpact();
    onRefresh();
  };

  return (
    <View style={styles.headerBlock}>
      <View style={styles.headerRow}>
        <View style={styles.flex1}>
          <Text style={styles.headerTitle}>Mes livraisons</Text>
          <Text style={styles.headerSub}>Suivez vos courses en temps réel et validez les OTP</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          activeOpacity={0.8}
          onPress={handlePressRefresh}
          accessibilityRole="button"
          accessibilityLabel="Actualiser les commandes"
        >
          <RefreshCw size={16} color={colors.text.body} />
        </TouchableOpacity>
      </View>

      <View style={styles.countersRow}>
        <View style={[styles.counterCard, styles.counterAmber]}>
          <Text style={[styles.counterValue, { color: colors.status.warningDark }]}>
            {activeCount}
          </Text>
          <Text style={[styles.counterLabel, { color: colors.status.warningDark }]}>
            En cours de livraison
          </Text>
        </View>
        <View style={[styles.counterCard, styles.counterEmerald]}>
          <Text style={[styles.counterValue, { color: colors.status.successDark }]}>
            {historyCount}
          </Text>
          <Text style={[styles.counterLabel, { color: colors.status.successDark }]}>
            Courses terminées
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    backgroundColor: colors.bg.surface,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  flex1: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: typography.families.black,
    color: colors.text.DEFAULT,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: typography.families.medium,
    color: colors.text.muted,
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.bg.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countersRow: {
    flexDirection: 'row',
    gap: 10,
  },
  counterCard: {
    flex: 1,
    borderRadius: radii.xl,
    padding: 12,
    borderWidth: 1,
  },
  counterAmber: {
    backgroundColor: colors.status.warningLight,
    borderColor: colors.status.warningBorder,
  },
  counterEmerald: {
    backgroundColor: colors.status.successLight,
    borderColor: colors.status.successBorder,
  },
  counterValue: {
    fontSize: 20,
    fontFamily: typography.families.black,
    fontVariant: ['tabular-nums'],
  },
  counterLabel: {
    fontSize: 11,
    fontFamily: typography.families.bold,
    marginTop: 2,
  },
});
