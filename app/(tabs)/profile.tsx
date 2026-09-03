import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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
  RatingStars,
} from '@daloa/ui';
import {
  Bike,
  ShieldCheck,
  ShieldAlert,
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
  const { user, driverProfile, logout, isAuthenticated, isAdmin } = useDriverAuth();

  const isVerified = Boolean(driverProfile?.is_verified);

  const handleLogout = async () => {
    Haptics.warning();
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil Livreur</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Avatar
              uri={driverProfile?.photo_url}
              name={driverProfile?.name || 'Livreur'}
              size={60}
            />
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.driverName} numberOfLines={1}>
                  {driverProfile?.name || 'Livreur Daloa'}
                </Text>
                <View style={[styles.badge, { backgroundColor: isVerified ? '#ECFDF5' : '#FFFBEB' }]}>
                  <Text style={[styles.badgeText, { color: isVerified ? '#059669' : '#D97706' }]}>
                    {isVerified ? 'VÉRIFIÉ' : 'EN ATTENTE'}
                  </Text>
                </View>
              </View>
              <Text style={styles.driverPhone}>{driverProfile?.phone || user?.email}</Text>
              <Text style={styles.driverVehicle}>
                🛵 Véhicule : {driverProfile?.vehicle_type?.toUpperCase() || 'MOTO'}
              </Text>
              <RatingStars
                rating={driverProfile?.rating || 5.0}
                totalReviews={driverProfile?.total_reviews || 0}
                size={11}
              />
            </View>
          </View>
        </View>

        {/* Espace Vérification CNI / KYC */}
        {!isVerified && (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push('/verification' as any)}
            style={styles.kycCard}
          >
            <View style={styles.kycIconWrapper}>
              <ShieldCheck size={22} color={colors.primary.DEFAULT} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.kycTitle}>Faites vérifier votre profil</Text>
              <Text style={styles.kycSub}>
                Téléversez votre CNI ou permis pour débloquer toutes les courses à Daloa.
              </Text>
            </View>
            <ChevronRight size={18} color={colors.grey[400]} />
          </TouchableOpacity>
        )}

        {/* Paramètres & Réseau */}
        <Text style={styles.sectionHeading}>Opérations & Règlements</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon={<CreditCard size={18} color={colors.primary.DEFAULT} />}
            title="Paramètres de retrait (Mobile Money)"
            subtitle="Configurer Wave, Orange Money, MTN MoMo, Moov"
            onPress={() => router.push('/payout-setup' as any)}
          />
          <MenuItem
            icon={<Users size={18} color={colors.secondary.DEFAULT} />}
            title="Annuaire des Livreurs Daloa"
            subtitle="Voir les coursiers partenaires enregistrés"
            onPress={() => router.push('/directory' as any)}
          />
          <MenuItem
            icon={<Store size={18} color="#8B5CF6" />}
            title="Mes Affiliations Boutiques"
            subtitle="Vendeurs qui vous ont désigné comme livreur attitré"
            onPress={() => router.push('/affiliations' as any)}
            isLast
          />
        </View>

        {/* Administration — masquée aux non-admins. L'autorisation réelle est
            appliquée en base (policies is_admin() et trigger de protection). */}
        {isAdmin ? (
          <>
            <Text style={styles.sectionHeading}>Administration</Text>
            <View style={styles.menuCard}>
              <MenuItem
                icon={<ShieldAlert size={18} color={colors.status.infoDark} />}
                title="Console d'administration"
                subtitle="Vérifier les livreurs et arbitrer les litiges"
                onPress={() => router.push('/admin' as any)}
                isLast
              />
            </View>
          </>
        ) : null}

        {/* Support & Règles */}
        <Text style={styles.sectionHeading}>Assistance & Légal</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon={<HelpCircle size={18} color={colors.grey[600]} />}
            title="Assistance & Support DaloaDelivery"
            subtitle="FAQ et contact équipe régulation"
            onPress={() => router.push('/legal/help' as any)}
          />
          <MenuItem
            icon={<FileText size={18} color={colors.grey[600]} />}
            title="Charte des Coursiers & CGU"
            subtitle="Règles d'éthique, ponctualité et sécurité"
            onPress={() => router.push('/legal/terms' as any)}
            isLast
          />
        </View>

        {/* Bouton Déconnexion */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={styles.logoutBtn}
        >
          <LogOut size={16} color={colors.status.error} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>DaloaDelivery Mobile • Version Officielle v2.0</Text>
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
  subtitle: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
    >
      <View style={styles.menuIconBox}>{icon}</View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSub}>{subtitle}</Text>
      </View>
      <ChevronRight size={18} color={colors.grey[300]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  scrollContent: {
    padding: 14,
    backgroundColor: '#F8F9FA',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '900',
  },
  driverPhone: {
    fontSize: 12,
    color: colors.grey[500],
    fontWeight: '500',
  },
  driverVehicle: {
    fontSize: 11.5,
    color: colors.primary[700],
    fontWeight: '600',
  },
  kycCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF4E6',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: radii.xl,
    padding: 12,
    marginBottom: 14,
  },
  kycIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kycTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.primary[800],
  },
  kycSub: {
    fontSize: 10.5,
    color: colors.primary[900],
    marginTop: 2,
    lineHeight: 14,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.grey[600],
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  menuSub: {
    fontSize: 11,
    color: colors.grey[400],
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radii.lg,
    padding: 12,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.status.error,
  },
  versionText: {
    fontSize: 11,
    color: colors.grey[400],
    textAlign: 'center',
    marginTop: 14,
    fontWeight: '500',
  },
});
