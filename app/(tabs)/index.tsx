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
  Button,
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
  Clock,
  Wallet,
} from 'lucide-react-native';
import { formatFCFA, Haptics } from '@daloa/utils';

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
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthBox}>
          <View style={styles.unauthIconCircle}>
            <Bike size={44} color={colors.primary.DEFAULT} />
          </View>
          <Text style={styles.unauthTitle}>Console Livreur DaloaDelivery</Text>
          <Text style={styles.unauthSub}>
            Connectez-vous à votre espace coursier pour recevoir les demandes de livraison dans tout Daloa.
          </Text>
          <View style={styles.unauthButtons}>
            <Button
              title="Connexion Livreur"
              variant="primary"
              size="lg"
              onPress={() => router.push('/auth/login' as any)}
              fullWidth
            />
            <View style={{ height: 10 }} />
            <Button
              title="Devenir Livreur Partenaire"
              variant="outline"
              size="lg"
              onPress={() => router.push('/auth/register' as any)}
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.driverInfo}>
          <View style={styles.logoBadge}>
            <Bike size={20} color="#FFFFFF" />
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
            trackColor={{ false: '#E5E7EB', true: colors.primary.DEFAULT }}
            thumbColor="#FFFFFF"
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
            tintColor={colors.primary.DEFAULT}
            colors={[colors.primary.DEFAULT]}
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
            <AlertCircle size={20} color="#D97706" />
            <View style={{ flex: 1 }}>
              <Text style={styles.offlineTitle}>Vous êtes actuellement Hors Ligne</Text>
              <Text style={styles.offlineSub}>
                Basculez En Ligne pour recevoir les alertes de courses disponibles à Daloa.
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Course Actuellement en cours (Action Prioritaire) */}
        {activeRun && (
          <View style={styles.activeRunCard}>
            <View style={styles.activeHeader}>
              <View style={styles.activePill}>
                <Zap size={13} color="#FFFFFF" />
                <Text style={styles.activePillText}>COURSE EN COURS</Text>
              </View>
              <View style={styles.activeStatusBadge}>
                <Text style={styles.activeStatusText}>
                  {activeRun.status === 'accepted' ? 'En ramassage' : 'En livraison'}
                </Text>
              </View>
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
                <Text style={styles.activeGainLabel}>Gain net (90%)</Text>
                <Text style={styles.activeGainAmount}>{formatFCFA(activeRun.driverNetGain)}</Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push(`/run/${activeRun.assignmentId}` as any)}
                style={styles.activeRunBtn}
              >
                <Navigation size={15} color="#FFFFFF" />
                <Text style={styles.activeRunBtnText}>Continuer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* KPIs du Jour */}
        <Text style={styles.sectionTitle}>Performances du Jour</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiIconWrapper}>
              <TrendingUp size={16} color={colors.primary.DEFAULT} />
            </View>
            <Text style={styles.kpiLabel}>Gains du jour</Text>
            <Text style={styles.kpiValue}>{formatFCFA(stats?.earningsToday || 0)}</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrapper, { backgroundColor: '#ECFDF5' }]}>
              <CheckCircle2 size={16} color="#059669" />
            </View>
            <Text style={styles.kpiLabel}>Courses livrées</Text>
            <Text style={[styles.kpiValue, { color: '#059669' }]}>
              {stats?.completedRunsToday || 0}
            </Text>
          </View>
        </View>

        {/* Raccourcis Rapides */}
        <Text style={styles.sectionTitle}>Accès Rapides</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/available' as any)}
            style={[styles.menuItem, styles.menuItemBorder]}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FFF4E6' }]}>
              <Zap size={20} color={colors.primary.DEFAULT} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Courses Disponibles</Text>
              <Text style={styles.menuSub}>Voir les livraisons en attente dans Daloa</Text>
            </View>
            <ChevronRight size={18} color={colors.grey[300]} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/directory' as any)}
            style={[styles.menuItem, styles.menuItemBorder]}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#EFF6FF' }]}>
              <Users size={20} color={colors.secondary.DEFAULT} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Annuaire des Livreurs Daloa</Text>
              <Text style={styles.menuSub}>Réseau des coursiers partenaires certifiés</Text>
            </View>
            <ChevronRight size={18} color={colors.grey[300]} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/verification' as any)}
            style={styles.menuItem}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#ECFDF5' }]}>
              <ShieldCheck size={20} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Vérification CNI & KYC</Text>
              <Text style={styles.menuSub}>
                {driverProfile?.is_verified
                  ? 'Compte vérifié & certifié'
                  : 'Téléverser votre pièce d’identité'}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.grey[300]} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  vehicleText: {
    fontSize: 11,
    color: colors.grey[500],
    fontWeight: '600',
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  statusToggleOnline: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.grey[400],
  },
  statusDotOnline: {
    backgroundColor: '#059669',
  },
  statusToggleText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.grey[600],
    letterSpacing: 0.5,
  },
  statusToggleTextOnline: {
    color: '#047857',
  },
  scrollContent: {
    padding: 14,
    backgroundColor: '#F8F9FA',
  },
  unauthBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  unauthIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  unauthTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  unauthSub: {
    fontSize: 13,
    color: colors.grey[600],
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    maxWidth: 280,
  },
  unauthButtons: {
    width: '100%',
    marginTop: 24,
  },
  offlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radii.xl,
    padding: 12,
    marginBottom: 14,
  },
  offlineTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#B45309',
  },
  offlineSub: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 2,
    lineHeight: 14,
  },
  activeRunCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT,
    padding: 14,
    marginBottom: 16,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  activeStatusBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  activeStatusText: {
    color: '#2563EB',
    fontSize: 10.5,
    fontWeight: '800',
  },
  activeRoute: {
    gap: 3,
    marginVertical: 4,
  },
  activeDistrict: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
  },
  activeLocation: {
    fontSize: 12,
    color: colors.grey[600],
  },
  activeBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  activeGainLabel: {
    fontSize: 10.5,
    color: colors.grey[500],
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  activeGainAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary[600],
  },
  activeRunBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  activeRunBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.grey[700],
    marginBottom: 8,
    marginLeft: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    gap: 4,
  },
  kpiIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: radii.md,
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.grey[500],
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
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
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  menuSub: {
    fontSize: 11,
    color: colors.grey[500],
    marginTop: 1,
  },
});
