import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { useActiveDriverRun, useDriverDailyStats } from '@daloa/api';
import {
  colors,
  radii,
  spacing,
  typography,
  StatCard,
  Card,
  Button,
  CurrencyText,
  StatusPill,
} from '@daloa/ui';
import {
  Bike,
  Zap,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronRight,
  TrendingUp,
} from 'lucide-react-native';
import { Haptics } from '@daloa/utils';

export default function DriverDashboardScreen() {
  const router = useRouter();
  const { driverProfile, isOnline, toggleOnlineStatus, isAuthenticated } = useDriverAuth();

  const { data: activeRun, refetch: refetchActiveRun } = useActiveDriverRun(driverProfile?.id);
  const { data: stats, refetch: refetchStats, isRefetching } = useDriverDailyStats(driverProfile?.id);

  const handleRefresh = async () => {
    await Promise.all([refetchActiveRun(), refetchStats()]);
  };

  const handleToggleOnline = async (val: boolean) => {
    Haptics.selection();
    await toggleOnlineStatus(val);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.unauthBox}>
          <Bike size={44} color={colors.delivery.primary} />
          <Text style={styles.unauthTitle}>Espace Livreur DaloaDelivery</Text>
          <Text style={styles.unauthSub}>
            Connectez-vous à votre compte coursier pour recevoir des livraisons dans toute la ville de Daloa.
          </Text>
          <Button
            title="Connexion Livreur"
            variant="delivery"
            size="lg"
            onPress={() => router.push('/auth/login')}
            style={{ width: '100%', marginTop: spacing[4] }}
          />
          <Button
            title="Devenir Livreur Partenaire"
            variant="secondary"
            size="lg"
            onPress={() => router.push('/auth/register')}
            style={{ width: '100%', marginTop: spacing[2] }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.driverInfo}>
          <View style={styles.logoBadge}>
            <Bike size={20} color="#090D16" />
          </View>
          <View>
            <Text style={styles.driverName}>{driverProfile?.name || 'Livreur Daloa'}</Text>
            <Text style={styles.vehicleText}>
              {driverProfile?.vehicle_type?.toUpperCase() || 'MOTO'} • Daloa
            </Text>
          </View>
        </View>

        {/* Switch En Ligne / Hors Ligne */}
        <View style={[styles.statusToggle, isOnline && styles.statusToggleOnline]}>
          <View style={[styles.statusDot, isOnline && styles.statusDotOnline]} />
          <Text style={[styles.statusToggleText, isOnline && styles.statusToggleTextOnline]}>
            {isOnline ? 'EN LIGNE' : 'HORS LIGNE'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: colors.dark.surfaceRaised, true: colors.delivery.primaryDark }}
            thumbColor={isOnline ? colors.delivery.primary : '#FFFFFF'}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.delivery.primary}
          />
        }
      >
        {/* Alerte si Hors Ligne */}
        {!isOnline && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleToggleOnline(true)}
            style={styles.offlineCard}
          >
            <AlertCircle size={20} color="#F59E0B" />
            <View style={{ flex: 1 }}>
              <Text style={styles.offlineTitle}>Vous êtes actuellement Hors Ligne</Text>
              <Text style={styles.offlineSub}>
                Basculez En Ligne pour recevoir les notifications de courses disponibles à Daloa.
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Course Actuellement en cours (Action Immédiate) */}
        {activeRun && (
          <Card variant="glowDelivery" style={styles.activeRunCard}>
            <View style={styles.activeHeader}>
              <View style={styles.activePill}>
                <Zap size={13} color="#FFFFFF" />
                <Text style={styles.activePillText}>COURSE EN COURS</Text>
              </View>
              <StatusPill status={activeRun.status} size="sm" />
            </View>

            <View style={styles.activeRoute}>
              <Text style={styles.activeDistrict}>
                📍 {activeRun.pickupDistrict} ➔ {activeRun.dropoffDistrict}
              </Text>
              <Text style={styles.activeLocation} numberOfLines={1}>
                {activeRun.status === 'accepted'
                  ? `Ramassage chez : ${activeRun.sellerName}`
                  : `Livraison chez : ${activeRun.buyerName}`}
              </Text>
            </View>

            <View style={styles.activeBottom}>
              <View>
                <Text style={styles.activeGainLabel}>Gain net</Text>
                <CurrencyText
                  amount={activeRun.driverNetGain}
                  size="xl"
                  weight="extrabold"
                  color={colors.delivery.primary}
                />
              </View>

              <Button
                title="Continuer la course"
                variant="delivery"
                size="md"
                onPress={() => router.push(`/run/${activeRun.assignmentId}`)}
                leftIcon={<Navigation size={16} color="#090D16" />}
              />
            </View>
          </Card>
        )}

        {/* KPIs du Jour */}
        <Text style={styles.sectionTitle}>Performances du Jour</Text>
        <View style={styles.kpiRow}>
          <StatCard
            label="Gains du jour"
            value={stats?.earningsToday || 0}
            isCurrency
            currencyColor={colors.delivery.primary}
            icon={<TrendingUp size={16} color={colors.delivery.primary} />}
          />
          <StatCard
            label="Courses livrées"
            value={stats?.completedRunsToday || 0}
            icon={<CheckCircle2 size={16} color="#10B981" />}
          />
        </View>

        {/* Raccourcis Rapides */}
        <Text style={styles.sectionTitle}>Accès Rapides</Text>
        <Card style={styles.menuCard}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/available')}
            style={[styles.menuItem, styles.menuItemBorder]}
          >
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(6, 182, 212, 0.12)' }]}>
              <Zap size={20} color={colors.delivery.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Courses Disponibles</Text>
              <Text style={styles.menuSub}>Voir les livraisons en attente dans Daloa</Text>
            </View>
            <ChevronRight size={18} color={colors.dark.textDim} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/directory')}
            style={[styles.menuItem, styles.menuItemBorder]}
          >
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
              <Users size={20} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Annuaire des Livreurs Daloa</Text>
              <Text style={styles.menuSub}>Réseau de confrères et livreurs partenaires</Text>
            </View>
            <ChevronRight size={18} color={colors.dark.textDim} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/verification')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <ShieldCheck size={20} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Vérification CNI & KYC</Text>
              <Text style={styles.menuSub}>
                {driverProfile?.is_verified
                  ? 'Compte vérifié & certifié'
                  : 'Téléverser votre pièce d’identité'}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.dark.textDim} />
          </TouchableOpacity>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
    backgroundColor: '#0E1422',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: radii.xl,
    backgroundColor: colors.delivery.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    color: colors.dark.text,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  vehicleText: {
    color: colors.dark.textDim,
    fontSize: 11,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceRaised,
    borderRadius: radii.full,
    paddingLeft: spacing[3],
    paddingRight: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.dark.border,
    gap: 6,
  },
  statusToggleOnline: {
    borderColor: 'rgba(6, 182, 212, 0.4)',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.dark.textDim,
  },
  statusDotOnline: {
    backgroundColor: colors.delivery.primary,
  },
  statusToggleText: {
    color: colors.dark.textDim,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  statusToggleTextOnline: {
    color: colors.delivery.primary,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[4],
  },
  offlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderRadius: radii.xl,
    padding: spacing[3] + 2,
    gap: spacing[3],
  },
  offlineTitle: {
    color: '#F59E0B',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  offlineSub: {
    color: colors.dark.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  activeRunCard: {
    padding: spacing[4],
    gap: spacing[3],
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.delivery.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.md,
    gap: 4,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    letterSpacing: 0.5,
  },
  activeRoute: {
    gap: 2,
  },
  activeDistrict: {
    color: colors.dark.text,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  activeLocation: {
    color: colors.dark.textDim,
    fontSize: typography.sizes.xs,
  },
  activeBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    paddingTop: spacing[3],
  },
  activeGainLabel: {
    color: colors.dark.textDim,
    fontSize: 11,
  },
  sectionTitle: {
    color: colors.dark.text,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing[3],
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
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    color: colors.dark.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  menuSub: {
    color: colors.dark.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  unauthBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  unauthTitle: {
    color: colors.dark.text,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  unauthSub: {
    color: colors.dark.textMuted,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
