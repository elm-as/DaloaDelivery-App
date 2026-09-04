import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import {
  colors,
  radii,
  spacing,
  AppText,
  AppPressable,
  Button,
  RatingStars,
  ConfirmDialog,
} from '@daloa/ui';
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
  User,
} from 'lucide-react-native';
import { Haptics } from '@daloa/utils';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
      router.replace('/(tabs)' as any);
    } catch (err) {
      console.warn('Erreur déconnexion livreur:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ── Vue Non Authentifiée ──
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FFA726', '#FF9800', '#E65100']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.unauthHeader}
        >
          <View style={styles.unauthIconCircle}>
            <Bike size={36} color="#E65100" />
          </View>
          <AppText variant="h1" color="#FFFFFF" center>
            Profil Livreur
          </AppText>
          <AppText variant="body" color="#FFE0B2" center style={{ marginTop: 4 }}>
            Connectez-vous pour gérer votre compte coursier.
          </AppText>
        </LinearGradient>

        <View style={styles.unauthCard}>
          <Button
            title="Se connecter"
            variant="primary"
            size="lg"
            onPress={() => router.push('/auth/login' as any)}
            fullWidth
          />
          <View style={{ height: 12 }} />
          <Button
            title="Devenir coursier partenaire"
            variant="outline"
            size="lg"
            onPress={() => router.push('/auth/register' as any)}
            fullWidth
          />
        </View>
      </View>
    );
  }

  // ── Vue Livreur Connecté ──
  return (
    <View style={styles.container}>
      {/* 1. Hero Header Dégradé avec Avatar & Badges */}
      <LinearGradient
        colors={['#FFA726', '#FF9800', '#E65100']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroHeader, { paddingTop: insets.top + spacing[3] }]}
      >
        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            {driverProfile?.photo_url ? (
              <ExpoImage
                source={{ uri: driverProfile.photo_url }}
                style={styles.avatarImg}
                contentFit="cover"
              />
            ) : (
              <View style={styles.fallbackAvatar}>
                <User size={28} color="#FFFFFF" />
              </View>
            )}
          </View>

          <View style={styles.profileDetails}>
            <View style={styles.nameBadgeRow}>
              <AppText variant="h2" color="#FFFFFF" numberOfLines={1} style={styles.driverName}>
                {driverProfile?.name || 'Livreur Daloa'}
              </AppText>
              <View
                style={[
                  styles.verifiedPill,
                  { backgroundColor: isVerified ? '#ECFDF5' : '#FFFBEB' },
                ]}
              >
                <AppText
                  variant="caption"
                  color={isVerified ? '#059669' : '#D97706'}
                  style={styles.verifiedText}
                >
                  {isVerified ? 'VÉRIFIÉ' : 'EN ATTENTE'}
                </AppText>
              </View>
            </View>

            <AppText variant="caption" color="rgba(255, 255, 255, 0.85)">
              📞 {driverProfile?.phone || user?.email || 'Non renseigné'}
            </AppText>
            <AppText variant="caption" color="rgba(255, 255, 255, 0.85)">
              🛵 {driverProfile?.vehicle_type?.toUpperCase() || 'MOTO'} · Daloa
            </AppText>

            <View style={{ marginTop: 4 }}>
              <RatingStars
                rating={driverProfile?.rating || 5.0}
                totalReviews={driverProfile?.total_reviews || 0}
                size={12}
              />
            </View>
          </View>
        </View>
      </LinearGradient>

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
            <ChevronRight size={18} color={colors.grey[400]} />
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
            <ChevronRight size={18} color={colors.grey[400]} />
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
            <ChevronRight size={18} color={colors.grey[400]} />
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
            <ChevronRight size={18} color={colors.grey[400]} />
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
            <ChevronRight size={18} color={colors.grey[400]} />
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
            <ChevronRight size={18} color={colors.grey[400]} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  flex1: {
    flex: 1,
  },
  unauthHeader: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[12],
    paddingBottom: spacing[10],
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
  },
  unauthIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  unauthCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing[4],
    marginTop: -spacing[4],
    borderRadius: radii['2xl'],
    padding: spacing[5],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroHeader: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  fallbackAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileDetails: {
    flex: 1,
    gap: 2,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  driverName: {
    fontWeight: '800',
  },
  verifiedPill: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: radii.full,
  },
  verifiedText: {
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  kycCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E6',
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
    borderRadius: radii.xl,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: '#FFE0B2',
    gap: spacing[3],
  },
  kycIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    marginHorizontal: spacing[4],
    marginTop: spacing[5],
    marginBottom: spacing[2],
    fontSize: 11,
    letterSpacing: 0.5,
  },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing[4],
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
    marginHorizontal: spacing[4],
    padding: spacing[3],
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#F3E8FF',
    gap: spacing[3],
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing[4],
    marginTop: spacing[6],
    marginBottom: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: spacing[2],
  },
});
