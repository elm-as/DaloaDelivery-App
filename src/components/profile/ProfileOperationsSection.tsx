import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Wallet, CreditCard, Users, Store, ChevronRight, Volume2 } from 'lucide-react-native';
import { colors, AppText, AppPressable } from '@daloa/ui';
import { profileStyles as styles } from './profileStyles';

export function ProfileOperationsSection() {
  const router = useRouter();

  return (
    <>
      <AppText variant="label" color={colors.text.muted} style={styles.sectionHeader}>
        OPÉRATIONS & RÈGLEMENTS
      </AppText>
      <View style={styles.cardGroup}>
        <AppPressable
          haptic="light"
          onPress={() => router.push('/(tabs)/earnings' as any)}
          style={styles.menuRow}
          accessibilityLabel="Mes gains et retraits"
        >
          <View style={[styles.menuIconWrap, { backgroundColor: colors.status.successLight }]}>
            <Wallet size={18} color={colors.status.successDark} />
          </View>
          <View style={styles.flex1}>
            <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
              Mes gains
            </AppText>
            <AppText variant="caption" color={colors.text.muted}>
              Solde disponible, retraits et historique des versements
            </AppText>
          </View>
          <ChevronRight size={18} color={colors.text.subtle} />
        </AppPressable>

        <AppPressable
          haptic="light"
          onPress={() => router.push('/payout-setup' as any)}
          style={[styles.menuRow, styles.borderBottom]}
          accessibilityLabel="Paramètres de retrait"
        >
          <View style={[styles.menuIconWrap, { backgroundColor: colors.primary[50] }]}>
            <CreditCard size={18} color={colors.primary[700]} />
          </View>
          <View style={styles.flex1}>
            <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
              Paramètres de retrait (Mobile Money)
            </AppText>
            <AppText variant="caption" color={colors.text.muted}>
              Wave, Orange Money, MTN MoMo, Moov
            </AppText>
          </View>
          <ChevronRight size={18} color={colors.text.subtle} />
        </AppPressable>

        <AppPressable
          haptic="light"
          onPress={() => router.push('/settings/alerts' as any)}
          style={[styles.menuRow, styles.borderBottom]}
          accessibilityLabel="Alertes et sonorités des courses"
        >
          <View style={[styles.menuIconWrap, { backgroundColor: colors.primary[50] }]}>
            <Volume2 size={18} color={colors.primary.DEFAULT} />
          </View>
          <View style={styles.flex1}>
            <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
              Alertes & Sonorités Courses
            </AppText>
            <AppText variant="caption" color={colors.text.muted}>
              Sonnerie d'urgence, synthèse vocale et vibreur
            </AppText>
          </View>
          <ChevronRight size={18} color={colors.text.subtle} />
        </AppPressable>

        <AppPressable
          haptic="light"
          onPress={() => router.push('/directory' as any)}
          style={[styles.menuRow, styles.borderBottom]}
          accessibilityLabel="Annuaire des livreurs"
        >
          <View style={[styles.menuIconWrap, { backgroundColor: colors.status.infoLight }]}>
            <Users size={18} color={colors.categories.electronics.text} />
          </View>
          <View style={styles.flex1}>
            <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
              Annuaire des Livreurs Daloa
            </AppText>
            <AppText variant="caption" color={colors.text.muted}>
              Voir les coursiers partenaires enregistrés
            </AppText>
          </View>
          <ChevronRight size={18} color={colors.text.subtle} />
        </AppPressable>

        <AppPressable
          haptic="light"
          onPress={() => router.push('/affiliations' as any)}
          style={styles.menuRow}
          accessibilityLabel="Mes boutiques affiliées"
        >
          <View style={[styles.menuIconWrap, { backgroundColor: colors.status.successLight }]}>
            <Store size={18} color={colors.status.successDark} />
          </View>
          <View style={styles.flex1}>
            <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
              Mes Boutiques Affiliées
            </AppText>
            <AppText variant="caption" color={colors.text.muted}>
              Marchands partenaires dont vous êtes le coursier attitré
            </AppText>
          </View>
          <ChevronRight size={18} color={colors.text.subtle} />
        </AppPressable>
      </View>
    </>
  );
}
