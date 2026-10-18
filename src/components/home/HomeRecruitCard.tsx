import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@daloa/ui';

export function HomeRecruitCard() {
  const router = useRouter();

  return (
    <View style={styles.recruitCard}>
      <View style={styles.recruitBadge}>
        <Text style={styles.recruitBadgeText}>OPPORTUNITÉ</Text>
      </View>
      <Text style={styles.recruitTitle}>Vous êtes coursier à Daloa ?</Text>
      <Text style={styles.recruitBody}>
        Rejoignez le réseau DaloaDelivery, recevez des courses directement sur votre
        téléphone et touchez 90 % des frais de livraison.
      </Text>
      <View style={styles.recruitActions}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/devenir-livreur' as any)}
          style={styles.recruitPrimaryBtn}
        >
          <Text style={styles.recruitPrimaryText}>Devenir livreur</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/auth/login' as any)}
          style={styles.recruitSecondaryBtn}
        >
          <Text style={styles.recruitSecondaryText}>Espace livreur</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  recruitCard: {
    marginHorizontal: spacing[4],
    marginTop: spacing[5],
    padding: spacing[4],
    borderRadius: radii['2xl'],
    backgroundColor: colors.bg.inverse,
    overflow: 'hidden',
  },
  recruitBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    backgroundColor: colors.primary[900],
    borderWidth: 1,
    borderColor: colors.primary[700],
    marginBottom: spacing[2],
  },
  recruitBadgeText: {
    fontSize: 9.5,
    fontFamily: typography.families.black,
    letterSpacing: 1,
    color: colors.primary[200],
  },
  recruitTitle: {
    fontSize: 17,
    fontFamily: typography.families.black,
    color: colors.text.inverse,
    marginBottom: 4,
  },
  recruitBody: {
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.grey[300],
    marginBottom: spacing[3],
  },
  recruitActions: {
    flexDirection: 'row',
    gap: 10,
  },
  recruitPrimaryBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: radii.xl,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
  },
  recruitPrimaryText: {
    fontSize: 12.5,
    fontFamily: typography.families.extrabold,
    color: colors.text.inverse,
  },
  recruitSecondaryBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: radii.xl,
    backgroundColor: colors.grey[800],
    borderWidth: 1,
    borderColor: colors.grey[700],
    alignItems: 'center',
  },
  recruitSecondaryText: {
    fontSize: 12.5,
    fontFamily: typography.families.extrabold,
    color: colors.text.inverse,
  },
});
