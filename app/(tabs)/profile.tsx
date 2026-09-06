import React, { useState } from 'react';
import { View, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bike,
  ShieldCheck,
  CreditCard,
  Users,
  Store,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react-native';
import { colors, spacing, AppText, AppPressable, ConfirmDialog } from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { UnauthenticatedProfileView } from '../../src/components/profile/UnauthenticatedProfileView';
import { ProfileHeroHeader } from '../../src/components/profile/ProfileHeroHeader';
import { profileStyles as styles } from '../../src/components/profile/profileStyles';

export default function DriverProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, driverProfile, logout, isAuthenticated, isAdmin } = useDriverAuth();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isVerified = Boolean(driverProfile?.is_verified);

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      Haptics.warning();
      await logout();
      setShowLogoutDialog(false);
      router.replace('/(tabs)/livreur' as any);
    } catch (err) {
      console.warn('Erreur déconnexion livreur:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ── Vue Non Authentifiée ──
  if (!isAuthenticated) {
    return (
      <UnauthenticatedProfileView
        onLogin={() => router.push('/auth/login' as any)}
        onRegister={() => router.push('/auth/register' as any)}
      />
    );
  }

  // ── Vue Livreur Connecté ──
  return (
    <View style={styles.container}>
      {/* 1. Hero Header Dégradé avec Avatar & Badges */}
      <ProfileHeroHeader
        driverProfile={driverProfile}
        user={user}
        topInset={insets.top}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 2. Invitation à la vérification KYC si non certifié */}
        {!isVerified && (
          <AppPressable
            haptic="light"
            onPress={() => router.push('/verification' as any)}
            style={styles.kycCard}
            accessibilityLabel="Faites vérifier votre profil"
          >
            <View style={styles.kycIconWrap}>
              <ShieldCheck size={22} color="#E65100" />
            </View>
            <View style={styles.flex1}>
              <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
                Faites vérifier votre profil
              </AppText>
              <AppText variant="caption" color={colors.text.muted}>
                Téléversez votre CNI ou permis pour débloquer toutes les courses à Daloa.
              </AppText>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </AppPressable>
        )}

        {/* 3. Section Opérations & Règlements */}
        <AppText variant="label" color={colors.text.muted} style={styles.sectionHeader}>
          OPÉRATIONS & RÈGLEMENTS
        </AppText>
        <View style={styles.cardGroup}>
          <AppPressable
            haptic="light"
            onPress={() => router.push('/payout-setup' as any)}
            style={[styles.menuRow, styles.borderBottom]}
            accessibilityLabel="Paramètres de retrait"
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#FFF4E6' }]}>
              <CreditCard size={18} color="#E65100" />
            </View>
            <View style={styles.flex1}>
              <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
                Paramètres de retrait (Mobile Money)
              </AppText>
              <AppText variant="caption" color={colors.text.muted}>
                Wave, Orange Money, MTN MoMo, Moov
              </AppText>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </AppPressable>

          <AppPressable
            haptic="light"
            onPress={() => router.push('/directory' as any)}
            style={[styles.menuRow, styles.borderBottom]}
            accessibilityLabel="Annuaire des livreurs"
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Users size={18} color="#2563EB" />
            </View>
            <View style={styles.flex1}>
              <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
                Annuaire des Livreurs Daloa
              </AppText>
              <AppText variant="caption" color={colors.text.muted}>
                Voir les coursiers partenaires enregistrés
              </AppText>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </AppPressable>

          <AppPressable
            haptic="light"
            onPress={() => router.push('/affiliations' as any)}
            style={styles.menuRow}
            accessibilityLabel="Mes boutiques affiliées"
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Store size={18} color="#059669" />
            </View>
            <View style={styles.flex1}>
              <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
                Mes Boutiques Affiliées
              </AppText>
              <AppText variant="caption" color={colors.text.muted}>
                Marchands partenaires dont vous êtes le coursier attitré
              </AppText>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </AppPressable>
        </View>

        {/* 4. Section Assistance & Légal */}
        <AppText variant="label" color={colors.text.muted} style={styles.sectionHeader}>
          ASSISTANCE & LÉGAL
        </AppText>
        <View style={styles.cardGroup}>
          <AppPressable
            haptic="light"
            onPress={() => {
              Linking.openURL('https://wa.me/2250700000000?text=Bonjour%2C%20je%20suis%20livreur%20DaloaDelivery').catch(() => {});
            }}
            style={[styles.menuRow, styles.borderBottom]}
            accessibilityLabel="Assistance livreurs WhatsApp"
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <HelpCircle size={18} color="#059669" />
            </View>
            <View style={styles.flex1}>
              <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
                Assistance Livreurs (WhatsApp)
              </AppText>
              <AppText variant="caption" color={colors.text.muted}>
                Support direct en cas d'urgence ou litige client
              </AppText>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </AppPressable>

          <AppPressable
            haptic="light"
            onPress={() => router.push('/legal/terms' as any)}
            style={styles.menuRow}
            accessibilityLabel="Conditions générales"
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#F3F4F6' }]}>
              <FileText size={18} color="#6B7280" />
            </View>
            <View style={styles.flex1}>
              <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
                Conditions Générales Livreurs
              </AppText>
              <AppText variant="caption" color={colors.text.muted}>
                Règles de sécurité, pourcentages et charte
              </AppText>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </AppPressable>
        </View>

        {/* 5. Console Admin si rôle autorisé */}
        {isAdmin && (
          <View style={{ marginTop: spacing[3] }}>
            <AppPressable
              haptic="light"
              onPress={() => router.push('/admin' as any)}
              style={styles.adminBanner}
              accessibilityLabel="Console Administration"
            >
              <Shield size={18} color="#9333EA" />
              <AppText variant="bodyStrong" color="#9333EA" style={styles.flex1}>
                Console Administration DaloaDelivery
              </AppText>
              <ChevronRight size={18} color="#9333EA" />
            </AppPressable>
          </View>
        )}

        {/* 6. Bouton Déconnexion avec ConfirmDialog */}
        <AppPressable
          haptic="medium"
          onPress={() => setShowLogoutDialog(true)}
          style={styles.logoutBtn}
          accessibilityLabel="Déconnexion du compte livreur"
        >
          <LogOut size={16} color={colors.status.error} />
          <AppText variant="label" color={colors.status.error}>
            Déconnexion du compte livreur
          </AppText>
        </AppPressable>
      </ScrollView>

      {/* Boîte de dialogue stylisée ConfirmDialog */}
      <ConfirmDialog
        visible={showLogoutDialog}
        type="danger"
        title="Déconnexion Livreur"
        message="Voulez-vous vraiment vous déconnecter de votre console DaloaDelivery ?"
        confirmText="Déconnexion"
        cancelText="Annuler"
        isLoading={isLoggingOut}
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={handleConfirmLogout}
      />
    </View>
  );
}
