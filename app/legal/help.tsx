import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography, Header, Card, Button } from '@daloa/ui';
import { MessageCircle, Phone } from 'lucide-react-native';
import { ENV_CONFIG } from '@daloa/config';
import { Haptics } from '@daloa/utils';

export default function DriverHelpScreen() {
  const router = useRouter();

  const handleWhatsApp = () => {
    Haptics.success();
    Linking.openURL(`https://wa.me/${ENV_CONFIG.SUPPORT_WHATSAPP}?text=Bonjour%20Support%20Livreur%20DaloaDelivery`);
  };

  const handleCall = () => {
    Haptics.lightImpact();
    Linking.openURL(`tel:${ENV_CONFIG.SUPPORT_PHONE}`);
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
      a: 'Vos gains nets sont immédiatement crédités sur votre portefeuille dans l’application. Vous pouvez demander un virement Wave ou Orange Money à tout moment.',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Assistance Livreur" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.supportCard}>
          <Text style={styles.supportTitle}>Ligne Directe Logistique</Text>
          <Text style={styles.supportSub}>
            L’équipe de régulation des courses est à votre disposition en direct pour tout blocage sur le terrain.
          </Text>

          <View style={styles.btnRow}>
            <Button
              title="WhatsApp Livreur"
              variant="success"
              size="md"
              leftIcon={<MessageCircle size={18} color="#FFFFFF" />}
              onPress={handleWhatsApp}
              style={{ flex: 1 }}
            />
            <Button
              title="Appeler"
              variant="secondary"
              size="md"
              leftIcon={<Phone size={18} color={colors.dark.text} />}
              onPress={handleCall}
            />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Foire Aux Questions (Livreurs)</Text>
        {faqs.map((faq, idx) => (
          <Card key={idx} style={styles.faqCard}>
            <Text style={styles.faqQ}>❓ {faq.q}</Text>
            <Text style={styles.faqA}>{faq.a}</Text>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[3],
  },
  supportCard: {
    padding: spacing[4],
    gap: spacing[2],
  },
  supportTitle: {
    color: colors.dark.text,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  supportSub: {
    color: colors.dark.textMuted,
    fontSize: typography.sizes.xs,
    lineHeight: 16,
    marginBottom: spacing[2],
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  sectionTitle: {
    color: colors.dark.text,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    marginTop: spacing[2],
  },
  faqCard: {
    padding: spacing[4],
    gap: spacing[2],
  },
  faqQ: {
    color: colors.dark.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  faqA: {
    color: colors.dark.textDim,
    fontSize: typography.sizes.xs,
    lineHeight: 18,
  },
});
