import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, Header, Card } from '@daloa/ui';

export default function DriverPrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Confidentialité des Données Livreur" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Text style={styles.title}>Données de localisation GPS</Text>
          <Text style={styles.text}>
            Votre position GPS est partagée en temps réel avec le vendeur et l'acheteur uniquement pendant la durée d'une course active pour assurer la transparence de la livraison.
          </Text>

          <Text style={styles.title}>Pièces d'identité (CNI)</Text>
          <Text style={styles.text}>
            Vos documents KYC sont stockés dans un espace de stockage chiffré et ne sont accessibles qu'aux administrateurs autorisés pour la validation de votre compte.
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
