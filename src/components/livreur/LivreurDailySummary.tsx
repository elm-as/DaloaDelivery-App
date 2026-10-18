import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { colors, radii, typography } from '@daloa/ui';
import { Haptics } from '@daloa/utils';

interface LivreurDailySummaryProps {
  earningsToday: number;
}

export function LivreurDailySummary({ earningsToday }: LivreurDailySummaryProps) {
  const router = useRouter();

  const handlePressDetails = () => {
    Haptics.lightImpact();
    router.push('/(tabs)/earnings');
  };

  return (
    <View style={styles.earningsCard}>
      <View>
        <Text style={styles.earningsLabel}>Gains du jour (net de commission)</Text>
        <View style={styles.earningsValueRow}>
          <Text style={styles.earningsValue}>
            {earningsToday.toLocaleString('fr-FR')}
          </Text>
          <Text style={styles.earningsCurrency}>FCFA</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.detailsBtn}
        activeOpacity={0.8}
        onPress={handlePressDetails}
        accessibilityRole="button"
        accessibilityLabel="Détails des gains"
      >
        <Text style={styles.detailsBtnText}>Détails</Text>
        <ChevronRight size={15} color={colors.primary[700]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  earningsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg.surface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  earningsLabel: {
    fontSize: 11,
    fontFamily: typography.families.medium,
    color: colors.text.muted,
    marginBottom: 2,
  },
  earningsValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  earningsValue: {
    fontSize: 22,
    fontFamily: typography.families.black,
    color: colors.primary[700],
    fontVariant: ['tabular-nums'],
  },
  earningsCurrency: {
    fontSize: 12,
    fontFamily: typography.families.bold,
    color: colors.text.muted,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.primary[50],
    borderRadius: radii.full,
  },
  detailsBtnText: {
    fontSize: 12,
    fontFamily: typography.families.bold,
    color: colors.primary[700],
  },
});
