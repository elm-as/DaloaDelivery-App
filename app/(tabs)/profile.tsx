import React, { useEffect, useState } from 'react';
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
  UserPen,
  Wallet,
  Mail,
  Trash2,
} from 'lucide-react-native';
import { colors, spacing, AppText, AppPressable, ConfirmDialog } from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import { getSupportWhatsAppUrl } from '@daloa/config';
import { supabase } from '@daloa/api';
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
        {/* 1 bis. Note · Livraisons · Quartiers — les trois compteurs du profil web */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <AppText variant="title" color={colors.primary.DEFAULT} style={styles.statValue}>
              {driverProfile?.total_reviews && driverProfile.total_reviews > 0 && driverProfile?.rating != null
                ? Number(driverProfile.rating).toFixed(1)
                : '-'}
            </AppText>
            <AppText variant="caption" style={styles.statLabel}>
              {driverProfile?.total_reviews && driverProfile.total_reviews > 0 ? 'Note globale' : 'Nouveau'}
            </AppText>
          </View>
          <View style={styles.statCard}>
            <AppText variant="title" color={colors.text.DEFAULT} style={styles.statValue}>
              {deliveredCount}
            </AppText>
            <AppText variant="caption" style={styles.statLabel}>Livraisons</AppText>
          </View>
          <View style={styles.statCard}>
            <AppText variant="title" color="#059669" style={styles.statValue}>
              {zonesCount}
            </AppText>
            <AppText variant="caption" style={styles.statLabel}>Quartiers</AppText>
          </View>
        </View>

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
            <View style={styles.menuIconWrap}>
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
            <ChevronRight size={18} color={colors.text.subtle} />
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
              Linking.openURL(getSupportWhatsAppUrl('Bonjour Support DaloaDelivery, je suis livreur et j\'ai besoin d\'assistance')).catch(() => {});
            }}
            style={[styles.menuRow, styles.borderBottom]}
            accessibilityLabel="Assistance livreurs WhatsApp"
          >
            <View style={[styles.menuIconWrap, { backgroundColor: colors.status.successLight }]}>
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
            <View style={[styles.menuIconWrap, { backgroundColor: '#F8FAFC' }]}>
              <FileText size={18} color="#64748B" />
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

        {/* 5 bis. Compte Email — repris du profil web */}
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

        {/* 5 ter. Suppression du compte — exigence Google Play et Apple :
            l'utilisateur doit pouvoir supprimer son compte depuis l'app. */}
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
