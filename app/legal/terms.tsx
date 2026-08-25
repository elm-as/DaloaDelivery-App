import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, Header, Card } from '@daloa/ui';

export default function DriverTermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Charte du Livreur DaloaDelivery" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Text style={styles.title}>1. Engagement & Ponctualité</Text>
          <Text style={styles.text}>
            Dès l'acceptation d'une course, le livreur s'engage à rejoindre le vendeur sous 15 minutes et à livrer le colis avec soin.
          </Text>

          <Text style={styles.title}>2. Double Code OTP Obligatoire</Text>
          <Text style={styles.text}>
            Le livreur ne doit JAMAIS remettre un colis sans avoir saisi le code secret OTP fourni par l'acheteur et sans avoir photographié la remise.
          </Text>

          <Text style={styles.title}>3. Intégrité des Marchandises</Text>
          <Text style={styles.text}>
            Il est strictement interdit d'ouvrir, d'altérer ou de détériorer les colis transportés. Tout vol donne lieu à des poursuites judiciaires et au blocage des fonds.
          </Text>

          <Text style={styles.title}>4. Reversement des Gains</Text>
          <Text style={styles.text}>
            Les gains nets (90% du montant de livraison) sont crédités instantanément après validation OTP et reversés sous 24h par Mobile Money.
          </Text>
        </Card>
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
  },
  card: {
    padding: spacing[4],
    gap: spacing[2],
  },
  title: {
    color: colors.dark.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginTop: spacing[2],
  },
  text: {
    color: colors.dark.textMuted,
    fontSize: typography.sizes.xs,
    lineHeight: 18,
  },
});
