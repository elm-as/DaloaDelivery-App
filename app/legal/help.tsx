import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography, Header, Card, Button } from '@daloa/ui';
import { MessageCircle } from 'lucide-react-native';
import { ENV_CONFIG, getSupportWhatsAppUrl, getSupportWhatsAppDisplay } from '@daloa/config';
import { Haptics } from '@daloa/utils';

export default function DriverHelpScreen() {
  const router = useRouter();

  const handleWhatsApp = () => {
    Haptics.success();
    Linking.openURL(getSupportWhatsAppUrl('Bonjour Support Livreur DaloaDelivery'));
  };

  const faqs = [
    {
      q: 'Que faire si le vendeur ne me donne pas le code OTP Pickup ?',
      a: 'N’emportez pas le colis sans le code OTP. Expliquez au vendeur que le code lui est affiché dans son espace vendeur pour sécuriser sa marchandise.',
    },
    {
      q: 'Que faire si l’acheteur est absent lors de la livraison ?',
      a: 'Appelez l’acheteur via le bouton dédié. S’il reste injoignable après 10 minutes, cliquez sur "Signaler un incident" pour obtenir l’aide de l’équipe de régulation.',
    },
    {
      q: 'Quand mes gains sont-ils versés ?',
      a: 'Vos gains nets (90%) sont immédiatement crédités sur votre portefeuille dans l’application. Vous pouvez demander un virement Wave ou Orange Money à tout moment.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Assistance Livreur" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Ligne Directe Logistique Daloa</Text>
          <Text style={styles.supportSub}>
            L’équipe de régulation des courses est joignable sur WhatsApp pour tout blocage sur le terrain. Nous ne prenons pas d’appels téléphoniques.
          </Text>

          <View style={styles.btnRow}>
            <Button
              title="WhatsApp Livreur"
              variant="whatsapp"
              size="md"
              leftIcon={<MessageCircle size={18} color={colors.text.inverse} />}
              onPress={handleWhatsApp}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Foire Aux Questions (Livreurs)</Text>
        {faqs.map((faq, idx) => (
          <View key={idx} style={styles.faqCard}>
            <Text style={styles.faqQ}>❓ {faq.q}</Text>
            <Text style={styles.faqA}>{faq.a}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.surface,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[3],
    backgroundColor: colors.bg.DEFAULT,
  },
  supportCard: {
    padding: spacing[4],
    gap: spacing[2],
    backgroundColor: colors.bg.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  supportTitle: {
    color: colors.text.DEFAULT,
    fontSize: typography.sizes.base,
    fontFamily: typography.families.bold,
  },
  supportSub: {
    color: colors.grey[600],
    fontSize: typography.sizes.xs,
    lineHeight: 16,
    marginBottom: spacing[2],
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  sectionTitle: {
    color: colors.text.DEFAULT,
    fontSize: typography.sizes.base,
    fontFamily: typography.families.bold,
    marginTop: spacing[2],
  },
  faqCard: {
    padding: spacing[4],
    gap: spacing[2],
    backgroundColor: colors.bg.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  faqQ: {
    color: colors.text.DEFAULT,
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.bold,
  },
  faqA: {
    color: colors.grey[600],
    fontSize: typography.sizes.xs,
    lineHeight: 18,
  },
});
