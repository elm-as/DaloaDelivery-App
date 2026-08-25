import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import {
  colors,
  radii,
  spacing,
  typography,
  Avatar,
  Card,
  Button,
  Badge,
  RatingStars,
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
  Phone,
} from 'lucide-react-native';
import { Haptics } from '@daloa/utils';

export default function DriverProfileScreen() {
  const router = useRouter();
  const { user, driverProfile, logout, isAuthenticated } = useDriverAuth();

  const isVerified = Boolean(driverProfile?.is_verified);

  const handleLogout = async () => {
    Haptics.warning();
    await logout();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Avatar
              uri={driverProfile?.photo_url}
              name={driverProfile?.name || 'Livreur'}
              size={64}
            />
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.driverName} numberOfLines={1}>
                  {driverProfile?.name || 'Livreur Daloa'}
                </Text>
                {isVerified ? (
                  <Badge label="VÉRIFIÉ" variant="verified" />
                ) : (
                  <Badge label="NON VÉRIFIÉ" variant="default" />
                )}
              </View>
              <Text style={styles.driverPhone}>{driverProfile?.phone || user?.email}</Text>
              <Text style={styles.driverVehicle}>
                🛵 Véhicule : {driverProfile?.vehicle_type?.toUpperCase() || 'MOTO'}
              </Text>
              <RatingStars
                rating={driverProfile?.rating || 5.0}
                totalReviews={driverProfile?.total_reviews || 0}
                size={12}
              />
            </View>
          </View>
        </Card>

        {/* Espace Vérification CNI / KYC */}
        {!isVerified && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/verification')}
            style={styles.kycCard}
          >
            <ShieldCheck size={22} color="#090D16" />
            <View style={{ flex: 1 }}>
              <Text style={styles.kycTitle}>Faites vérifier votre profil</Text>
              <Text style={styles.kycSub}>
                Téléversez votre CNI ou permis de conduire pour recevoir plus de courses et accéder aux courses premium.
              </Text>
            </View>
            <ChevronRight size={18} color="#090D16" />
          </TouchableOpacity>
        )}

        {/* Gestion & Outils */}
        <Text style={styles.sectionTitle}>Gestion & Paramètres</Text>
        <Card style={styles.menuCard}>
          <MenuItem
            icon={<CreditCard size={20} color={colors.delivery.primary} />}
            title="Paramètres de retrait (Mobile Money)"
            subtitle="Configurer Wave, Orange, MTN ou Moov"
            onPress={() => router.push('/payout-setup')}
          />
          <MenuItem
            icon={<Store size={20} color="#F59E0B" />}
            title="Mes Boutiques Affiliées"
            subtitle="Voir les commerçants partenaires"
            onPress={() => router.push('/affiliations')}
          />
          <MenuItem
            icon={<Users size={20} color="#3B82F6" />}
            title="Annuaire des Livreurs de Daloa"
            subtitle="Voir tous les livreurs actifs de la ville"
            onPress={() => router.push('/directory')}
            isLast
          />
        </Card>

        {/* Aide & Juridique */}
        <Text style={styles.sectionTitle}>Assistance & Règles</Text>
        <Card style={styles.menuCard}>
          <MenuItem
            icon={<HelpCircle size={20} color={colors.dark.textMuted} />}
            title="Centre d'aide livreur"
            subtitle="Procédures OTP, litiges et support WhatsApp"
            onPress={() => router.push('/legal/help')}
          />
          <MenuItem
            icon={<FileText size={20} color={colors.dark.textMuted} />}
            title="Conditions Générales des Livreurs"
            subtitle="Charte de livraison et règles de sécurité"
            onPress={() => router.push('/legal/terms')}
            isLast
          />
        </Card>

        {/* Déconnexion */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={styles.logoutBtn}
        >
          <LogOut size={18} color={colors.status.error} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>DaloaDelivery v1.0.0 • ElmasCore © 2026</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  isLast = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        Haptics.lightImpact();
        onPress();
      }}
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
    >
      <View style={styles.menuIconContainer}>{icon}</View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSub}>{subtitle}</Text>}
      </View>
      <ChevronRight size={18} color={colors.dark.textDim} />
    </TouchableOpacity>
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
  profileCard: {
    padding: spacing[4],
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  driverName: {
    color: colors.dark.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  driverPhone: {
    color: colors.dark.textMuted,
    fontSize: typography.sizes.xs,
  },
  driverVehicle: {
    color: colors.delivery.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  kycCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.delivery.primary,
    borderRadius: radii['2xl'],
    padding: spacing[4],
    gap: spacing[3],
  },
  kycTitle: {
    color: '#090D16',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  kycSub: {
    color: 'rgba(9, 13, 22, 0.85)',
    fontSize: 11,
    lineHeight: 15,
  },
  sectionTitle: {
    color: colors.dark.text,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    marginTop: spacing[2],
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3] + 2,
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    backgroundColor: colors.dark.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    color: colors.dark.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  menuSub: {
    color: colors.dark.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    paddingVertical: spacing[3],
    borderRadius: radii.xl,
    gap: spacing[2],
    marginTop: spacing[3],
  },
  logoutText: {
    color: colors.status.error,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  versionText: {
    color: colors.dark.textDim,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: spacing[2],
  },
});
