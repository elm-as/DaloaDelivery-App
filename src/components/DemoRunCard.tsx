import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, ArrowRight, PackageCheck } from 'lucide-react-native';
import { colors, radii, typography } from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import { DEMO_ASSIGNMENT_ID } from '../services/demoRunService';

interface DemoRunCardProps {
  onStartDemo?: () => void;
}

export function DemoRunCard({ onStartDemo }: DemoRunCardProps) {
  const router = useRouter();

  const handlePress = () => {
    Haptics.success();
    if (onStartDemo) {
      onStartDemo();
      return;
    }
    router.push(`/run/${DEMO_ASSIGNMENT_ID}` as any);
  };

  return (
    <View style={styles.card}>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Sparkles size={12} color={colors.primary[700]} />
          <Text style={styles.badgeText}>Évaluateur & Testeurs</Text>
        </View>
        <Text style={styles.gainText}>+1 350 FCFA net</Text>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.iconBox}>
          <PackageCheck size={22} color={colors.primary.DEFAULT} />
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.title}>Simuler une course de test</Text>
          <Text style={styles.description}>
            Testez le flux complet (ramassage marché, guidage GPS, validation par code OTP) sans attendre une commande réelle.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Lancer la course de test"
      >
        <Text style={styles.buttonText}>Lancer la course d'évaluation</Text>
        <ArrowRight size={16} color={colors.text.inverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.primary[200],
    marginVertical: 8,
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: typography.families.bold,
    color: colors.primary[700],
  },
  gainText: {
    fontSize: 12,
    fontFamily: typography.families.bold,
    color: colors.status.successDark,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: typography.families.bold,
    color: colors.text.DEFAULT,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    fontFamily: typography.families.normal,
    color: colors.text.muted,
    lineHeight: 16,
  },
  button: {
    backgroundColor: colors.primary.DEFAULT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    gap: 8,
    marginTop: 4,
  },
  buttonText: {
    fontSize: 13,
    fontFamily: typography.families.bold,
    color: colors.text.inverse,
  },
});
