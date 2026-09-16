import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, Wallet, Zap } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '@daloa/ui';

export const LoginValueProps: React.FC = () => {
  return (
    <View style={styles.valueSection}>
      <View style={styles.valueCard}>
        <View style={[styles.valueIconWrap, { backgroundColor: colors.primary[50] }]}>
          <Wallet size={18} color={colors.primary[700]} />
        </View>
        <View style={styles.valueContent}>
          <Text style={styles.valueTitle}>Rémunération Transparente</Text>
          <Text style={styles.valueDesc}>
            Reversement direct de vos gains de livraison sur Wave ou MTN.
          </Text>
        </View>
      </View>

      <View style={styles.valueCard}>
        <View style={[styles.valueIconWrap, { backgroundColor: '#FEF3C7' }]}>
          <Shield size={18} color={colors.categories.home.text} />
        </View>
        <View style={styles.valueContent}>
          <Text style={styles.valueTitle}>Sécurité Couvre-Feu (22h30)</Text>
          <Text style={styles.valueDesc}>
            Courses suspendues la nuit pour protéger les coursiers et les colis.
          </Text>
        </View>
      </View>

      <View style={styles.valueCard}>
        <View style={[styles.valueIconWrap, { backgroundColor: colors.status.successLight }]}>
          <Zap size={18} color="#059669" />
        </View>
        <View style={styles.valueContent}>
          <Text style={styles.valueTitle}>Alertes Courses en Temps Réel</Text>
          <Text style={styles.valueDesc}>
            Attribution directe dès qu'un acheteur passe commande à Daloa.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  valueSection: {
    marginHorizontal: spacing[4],
    marginTop: spacing[6],
    gap: spacing[3],
  },
  valueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radii.xl,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.bg.subtle,
    gap: spacing[3],
  },
  valueIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 14,
    fontFamily: typography.families.bold,
    color: colors.text.DEFAULT,
  },
  valueDesc: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
    lineHeight: 16,
  },
});
