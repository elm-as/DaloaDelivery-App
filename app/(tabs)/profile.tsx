import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ShieldCheck,
  LogOut,
  ChevronRight,
  Shield,
  UserPen,
  Mail,
  Trash2,
} from 'lucide-react-native';
import { colors, spacing, AppText, AppPressable, ConfirmDialog } from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import { supabase } from '@daloa/api';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { UnauthenticatedProfileView } from '../../src/components/profile/UnauthenticatedProfileView';
import { ProfileHeroHeader } from '../../src/components/profile/ProfileHeroHeader';
import { ProfileStatsRow } from '../../src/components/profile/ProfileStatsRow';
import { ProfileOperationsSection } from '../../src/components/profile/ProfileOperationsSection';
import { ProfileLegalSection } from '../../src/components/profile/ProfileLegalSection';
import { profileStyles as styles } from '../../src/components/profile/profileStyles';

export default function DriverProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, driverProfile, logout, isAuthenticated, isAdmin } = useDriverAuth();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [deliveredCount, setDeliveredCount] = useState(0);

  const isVerified = Boolean(driverProfile?.is_verified);
  const zonesCount = driverProfile?.coverage_zones?.length || 0;

  /* Cumul des courses livrees, comme le compteur « Livraisons » du profil web. */
  useEffect(() => {
    if (!driverProfile?.id) return;
    let cancelled = false;

    supabase
      .from('delivery_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('delivery_person_id', driverProfile.id)
      .eq('status', 'delivered')
      .then(({ count }) => {
        if (!cancelled) setDeliveredCount(count || 0);
      });

    return () => {
      cancelled = true;
    };
  }, [driverProfile?.id]);

  /* Meme libelle de statut que la ligne « Verification » du web. */
  const verificationSubtitle = isVerified
    ? 'Profil vérifié'
    : driverProfile?.verification_status === 'rejected'
      ? `Refusé : ${driverProfile?.verification_rejection_reason || 'voir détails'}`
      : driverProfile?.verification_status === 'pending' || driverProfile?.cni_url
        ? "Document en cours d'examen"
        : 'Soumettre un document';

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
        {/* 1 bis. Note · Livraisons · Quartiers — compteurs tabular-nums */}
        <ProfileStatsRow
          rating={driverProfile?.rating}
          totalReviews={driverProfile?.total_reviews}
          deliveredCount={deliveredCount}
          zonesCount={zonesCount}
        />

        {/* 2. Invitation à la vérification KYC si non certifié */}
        {!isVerified && (
          <AppPressable
            haptic="light"
            onPress={() => router.push('/verification' as any)}
            style={styles.kycCard}
            accessibilityLabel="Faites vérifier votre profil"
          >
            <View style={styles.kycIconWrap}>
              <ShieldCheck size={22} color={colors.primary[700]} />
            </View>
            <View style={styles.flex1}>
              <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
                Faites vérifier votre profil
              </AppText>
              <AppText variant="caption" color={colors.text.muted}>
                Téléversez votre pièce d'identité, et votre permis si vous roulez en moto, voiture ou triporteur.
              </AppText>
            </View>
            <ChevronRight size={18} color={colors.text.subtle} />
          </AppPressable>
        )}

        {/* 2 bis. Modifier mon profil — miroir du web (nom, téléphone, zones…) */}
        <AppText variant="label" color={colors.text.muted} style={styles.sectionHeader}>
          MON PROFIL LIVREUR
        </AppText>
        <View style={styles.cardGroup}>
          <AppPressable
            haptic="light"
            onPress={() => router.push('/profile/edit' as any)}
            style={styles.menuRow}
            accessibilityLabel="Modifier mon profil"
          >
            <View style={styles.menuIconWrap}>
              <UserPen size={18} color={colors.primary[700]} />
            </View>
            <View style={styles.flex1}>
              <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
                Modifier mon profil
              </AppText>
              <AppText variant="caption" color={colors.text.muted}>
                Nom, téléphone, véhicule, zones couvertes et tarifs
              </AppText>
            </View>
            <ChevronRight size={18} color={colors.text.subtle} />
          </AppPressable>

          <AppPressable
            haptic="light"
            onPress={() => router.push('/verification' as any)}
            style={[styles.menuRow, styles.borderBottom]}
            accessibilityLabel="Vérification de mon profil"
          >
            <View style={[styles.menuIconWrap, { backgroundColor: colors.status.infoLight }]}>
              <ShieldCheck size={18} color={colors.status.info} />
            </View>
            <View style={styles.flex1}>
              <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
                Vérification
              </AppText>
              <AppText variant="caption" color={colors.text.muted}>
                {verificationSubtitle}
              </AppText>
            </View>
            <ChevronRight size={18} color={colors.text.subtle} />
          </AppPressable>
        </View>

        {/* 3. Section Opérations & Règlements */}
        <ProfileOperationsSection />

        {/* 4. Section Assistance & Légal */}
        <ProfileLegalSection />

        {/* 5. Console Admin si rôle autorisé */}
        {isAdmin && (
          <View style={{ marginTop: spacing[3] }}>
            <AppPressable
              haptic="light"
              onPress={() => router.push('/admin' as any)}
              style={styles.adminBanner}
              accessibilityLabel="Console Administration"
            >
              <Shield size={18} color={colors.secondary.DEFAULT} />
              <AppText variant="bodyStrong" color={colors.secondary.DEFAULT} style={styles.flex1}>
                Console Administration DaloaDelivery
              </AppText>
              <ChevronRight size={18} color={colors.secondary.DEFAULT} />
            </AppPressable>
          </View>
        )}

        {/* 5 bis. Compte Email */}
        <View style={styles.emailCard}>
          <View style={[styles.menuIconWrap, { backgroundColor: colors.bg.subtle }]}>
            <Mail size={18} color={colors.text.muted} />
          </View>
          <View style={styles.flex1}>
            <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
              Compte Email
            </AppText>
            <AppText variant="caption" color={colors.text.muted} numberOfLines={1}>
              {user?.email || '—'}
            </AppText>
          </View>
        </View>

        {/* 5 ter. Suppression du compte — exigence Google Play et Apple */}
        <AppText variant="label" color={colors.text.muted} style={styles.sectionHeader}>
          ZONE DE DANGER
        </AppText>
        <View style={styles.cardGroup}>
          <AppPressable
            haptic="medium"
            onPress={() => router.push('/settings/delete-account' as any)}
            style={styles.menuRow}
            accessibilityLabel="Supprimer mon compte livreur"
          >
            <View style={[styles.menuIconWrap, { backgroundColor: colors.status.errorLight }]}>
              <Trash2 size={18} color={colors.status.error} />
            </View>
            <View style={styles.flex1}>
              <AppText variant="bodyStrong" color={colors.status.error}>
                Supprimer mon compte
              </AppText>
              <AppText variant="caption" color={colors.text.muted}>
                Efface définitivement votre fiche livreur et vos données
              </AppText>
            </View>
            <ChevronRight size={18} color={colors.text.subtle} />
          </AppPressable>
        </View>

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
