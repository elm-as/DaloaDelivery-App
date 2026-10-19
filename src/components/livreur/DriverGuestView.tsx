import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Truck, ShieldCheck, Wallet, Clock, LogIn, UserPlus } from 'lucide-react-native';
import { colors, radii, spacing, typography, Button } from '@daloa/ui';
import { Haptics } from '@daloa/utils';

export function DriverGuestView() {
  const router = useRouter();

  const handleLogin = () => {
    Haptics.selection();
    router.push('/auth/login' as any);
  };

  const handleRegister = () => {
    Haptics.selection();
    router.push('/auth/register' as any);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* En-tête sobre et direct */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.statusDot} />
          <Text style={styles.badgeText}>RÉSEAU DE LIVRAISON DALOA</Text>
        </View>
        <Text style={styles.headerTitle}>Espace Livreur</Text>
        <Text style={styles.headerSubtitle}>
          Gérez vos courses en direct ou rejoignez la première flotte de coursiers de Daloa.
        </Text>
      </View>

      {/* Carte d'action principale - Déjà coursier */}
      <View style={styles.actionCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Truck size={24} color={colors.primary.DEFAULT} />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>Déjà coursier partenaire ?</Text>
            <Text style={styles.cardSubtitle}>
              Connectez-vous pour voir vos courses et démarrer vos tournées.
            </Text>
          </View>
        </View>

        <Button
          title="Se connecter à mon compte"
          variant="primary"
          size="lg"
          leftIcon={<LogIn size={18} color={colors.text.inverse} />}
          onPress={handleLogin}
          fullWidth
        />
      </View>

      {/* Carte Nouveau livreur */}
      <View style={styles.registerCard}>
        <View style={styles.registerContent}>
          <Text style={styles.registerTitle}>Vous avez une moto ou un tricycle ?</Text>
          <Text style={styles.registerBody}>
            Devenez coursier indépendant, fixez vos disponibilités et touchez 90 % nets sur chaque livraison.
          </Text>
        </View>

        <Button
          title="Créer un profil livreur"
          variant="outline"
          size="lg"
          leftIcon={<UserPlus size={18} color={colors.primary.DEFAULT} />}
          onPress={handleRegister}
          fullWidth
        />
      </View>

      {/* Avantages clés */}
      <View style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>LES AVANTAGES PARTENAIRES</Text>

        <View style={styles.benefitItem}>
          <View style={[styles.benefitIconWrap, { backgroundColor: colors.primary[50] }]}>
            <Wallet size={20} color={colors.primary[700]} />
          </View>
          <View style={styles.benefitTextWrap}>
            <Text style={styles.benefitTitle}>90 % des gains nets</Text>
            <Text style={styles.benefitBody}>
              Encaissez directement les frais de course, avec reversement rapide Wave ou Orange Money.
            </Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <View style={[styles.benefitIconWrap, { backgroundColor: '#ECFDF5' }]}>
            <Clock size={20} color="#059669" />
          </View>
          <View style={styles.benefitTextWrap}>
            <Text style={styles.benefitTitle}>Liberté & flexibilité</Text>
            <Text style={styles.benefitBody}>
              Vous choisissez quand vous êtes en ligne et dans quels quartiers de Daloa vous intervenez.
            </Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <View style={[styles.benefitIconWrap, { backgroundColor: '#FEF3C7' }]}>
            <ShieldCheck size={20} color="#D97706" />
          </View>
          <View style={styles.benefitTextWrap}>
            <Text style={styles.benefitTitle}>Courses vérifiées & sécurité</Text>
            <Text style={styles.benefitBody}>
              Validation par code OTP, suivi sur carte et protection nocturne par couvre-feu de sécurité.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
  },
  header: {
    marginBottom: spacing[5],
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing[2],
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary.DEFAULT,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: typography.families.black,
    letterSpacing: 0.8,
    color: colors.primary.DEFAULT,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: typography.families.black,
    color: colors.text.DEFAULT,
    marginBottom: spacing[1],
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: typography.families.normal,
    color: colors.text.muted,
    lineHeight: 18,
  },
  actionCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing[4],
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: typography.families.bold,
    color: colors.text.DEFAULT,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: typography.families.normal,
    color: colors.text.muted,
    lineHeight: 16,
  },
  registerCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  registerContent: {
    marginBottom: spacing[4],
  },
  registerTitle: {
    fontSize: 15,
    fontFamily: typography.families.bold,
    color: colors.text.DEFAULT,
    marginBottom: 4,
  },
  registerBody: {
    fontSize: 12.5,
    fontFamily: typography.families.normal,
    color: colors.text.muted,
    lineHeight: 18,
  },
  benefitsSection: {
    gap: spacing[3],
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: typography.families.bold,
    letterSpacing: 0.6,
    color: colors.text.subtle,
    marginBottom: spacing[1],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.bg.surface,
    borderRadius: radii.xl,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: 12,
  },
  benefitIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  benefitTextWrap: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 13.5,
    fontFamily: typography.families.bold,
    color: colors.text.DEFAULT,
    marginBottom: 2,
  },
  benefitBody: {
    fontSize: 12,
    fontFamily: typography.families.normal,
    color: colors.text.muted,
    lineHeight: 16,
  },
});
