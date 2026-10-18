import React from 'react';
import { View, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { HelpCircle, FileText, Shield, ChevronRight } from 'lucide-react-native';
import { colors, AppText, AppPressable } from '@daloa/ui';
import { getSupportWhatsAppUrl } from '@daloa/config';
import { profileStyles as styles } from './profileStyles';

export function ProfileLegalSection() {
  const router = useRouter();

  const handleOpenSupport = () => {
    Linking.openURL(
      getSupportWhatsAppUrl("Bonjour Support DaloaDelivery, je suis livreur et j'ai besoin d'assistance")
    ).catch(() => {});
  };

  return (
    <>
      <AppText variant="label" color={colors.text.muted} style={styles.sectionHeader}>
        ASSISTANCE & LÉGAL
      </AppText>
      <View style={styles.cardGroup}>
        <AppPressable
          haptic="light"
          onPress={handleOpenSupport}
          style={[styles.menuRow, styles.borderBottom]}
          accessibilityLabel="Assistance livreurs WhatsApp"
        >
          <View style={[styles.menuIconWrap, { backgroundColor: colors.status.successLight }]}>
            <HelpCircle size={18} color={colors.status.successDark} />
          </View>
          <View style={styles.flex1}>
            <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
              Assistance Livreurs (WhatsApp)
            </AppText>
            <AppText variant="caption" color={colors.text.muted}>
              Support direct en cas d'urgence ou litige client
            </AppText>
          </View>
          <ChevronRight size={18} color={colors.text.subtle} />
        </AppPressable>

        <AppPressable
          haptic="light"
          onPress={() => router.push('/legal/terms' as any)}
          style={[styles.menuRow, styles.borderBottom]}
          accessibilityLabel="Conditions générales"
        >
          <View style={[styles.menuIconWrap, { backgroundColor: colors.bg.subtle }]}>
            <FileText size={18} color={colors.text.muted} />
          </View>
          <View style={styles.flex1}>
            <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
              Conditions Générales d'Utilisation
            </AppText>
            <AppText variant="caption" color={colors.text.muted}>
              Charte officielle, sécurité et reversement des gains
            </AppText>
          </View>
          <ChevronRight size={18} color={colors.text.subtle} />
        </AppPressable>

        <AppPressable
          haptic="light"
          onPress={() => router.push('/legal/privacy' as any)}
          style={[styles.menuRow, styles.borderBottom]}
          accessibilityLabel="Politique de confidentialité"
        >
          <View style={[styles.menuIconWrap, { backgroundColor: colors.status.infoLight }]}>
            <Shield size={18} color={colors.status.info} />
          </View>
          <View style={styles.flex1}>
            <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
              Protection & Confidentialité
            </AppText>
            <AppText variant="caption" color={colors.text.muted}>
              Données GPS, pièces d'identité et sécurité
            </AppText>
          </View>
          <ChevronRight size={18} color={colors.text.subtle} />
        </AppPressable>

        <AppPressable
          haptic="light"
          onPress={() => router.push('/legal/legal-notice' as any)}
          style={styles.menuRow}
          accessibilityLabel="Mentions légales"
        >
          <View style={[styles.menuIconWrap, { backgroundColor: colors.bg.subtle }]}>
            <FileText size={18} color={colors.text.muted} />
          </View>
          <View style={styles.flex1}>
            <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
              Mentions Légales & Éditeur
            </AppText>
            <AppText variant="caption" color={colors.text.muted}>
              Identité juridique, hébergeur et infrastructure
            </AppText>
          </View>
          <ChevronRight size={18} color={colors.text.subtle} />
        </AppPressable>
      </View>
    </>
  );
}
