import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bike, Zap, Clock, Wallet, UserCheck, Shield, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { colors, radii, spacing, Button, AppText } from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import { useActiveDriverRun, useDriverDailyStats } from '@daloa/api';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { DeliveryTopBar } from '../../src/components/DeliveryTopBar';
import { DriverHeroHeader } from '../../src/components/DriverHeroHeader';
import { DriverStatsRow } from '../../src/components/DriverStatsRow';

export default function LivreurTabScreen() {
  const router = useRouter();
  const { driverProfile, isOnline, toggleOnlineStatus, isAuthenticated } = useDriverAuth();

  const { data: activeRun, refetch: refetchActiveRun } = useActiveDriverRun(driverProfile?.id);
  const { data: stats, refetch: refetchStats, isRefetching } = useDriverDailyStats(driverProfile?.id);

  const handleRefresh = async () => {
    await Promise.all([refetchActiveRun(), refetchStats()]);
  };

  const handleToggleOnline = async () => {
    Haptics.selection();
    await toggleOnlineStatus(!isOnline);
  };

  // ── Cas 1 : Visiteur non connecté (Page de recrutement / Espace Livreur) ──
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <DeliveryTopBar title="Espace Livreur" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.unauthContent}
        >
          <LinearGradient
            colors={['#FFA726', '#FF9800', '#E65100']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.unauthHero}
          >
            <View style={styles.unauthIconCircle}>
              <Bike size={32} color="#E65100" />
            </View>
            <Text style={styles.unauthHeroTitle}>
              Rejoignez la flotte{'\n'}DaloaDelivery
            </Text>
            <Text style={styles.unauthHeroSub}>
              Devenez coursier partenaire à Daloa et générez des revenus réguliers avec des paiements directs.
            </Text>
          </LinearGradient>

          <View style={styles.perksCard}>
            <Text style={styles.perksHeader}>Pourquoi livrer avec nous ?</Text>

            <View style={styles.perkRow}>
              <View style={[styles.perkIcon, { backgroundColor: '#ECFDF5' }]}>
                <Wallet size={16} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.perkTitle}>Paiements Wave & MTN</Text>
                <Text style={styles.perkDesc}>Encaissez vos gains chaque jour directement sur votre compte mobile money.</Text>
              </View>
            </View>

            <View style={styles.perkRow}>
              <View style={[styles.perkIcon, { backgroundColor: '#FFF4E6' }]}>
                <Zap size={16} color="#E65100" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.perkTitle}>Courses en direct</Text>
                <Text style={styles.perkDesc}>Recevez les demandes de livraison en temps réel sur toute la ville de Daloa.</Text>
              </View>
            </View>

            <View style={styles.perkRow}>
              <View style={[styles.perkIcon, { backgroundColor: '#EFF6FF' }]}>
                <Shield size={16} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.perkTitle}>Profil vérifié & sécurisé</Text>
                <Text style={styles.perkDesc}>Bénéficiez de la confiance des commerçants et clients de DaloaMarket.</Text>
              </View>
            </View>

            <View style={styles.actionButtonsWrap}>
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
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Cas 2 : Livreur connecté (Console de bord) ──
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DeliveryTopBar title="Console Livreur" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={['#FF6B00']}
            tintColor="#FF6B00"
          />
        }
      >
        <DriverHeroHeader
          driverProfile={driverProfile}
          isOnline={isOnline}
          onToggleOnline={handleToggleOnline}
          onRefresh={handleRefresh}
          isRefreshing={isRefetching}
        />

        <DriverStatsRow
          earningsToday={stats?.earningsToday || 0}
          completedRunsToday={stats?.completedRunsToday || 0}
          rating={driverProfile?.rating || 5.0}
        />

        {/* Section Navigation Rapide Console */}
        <View style={styles.quickNavSection}>
          <Text style={styles.sectionTitle}>GESTION DES COURSES</Text>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => router.push('/(tabs)/available')}
          >
            <View style={[styles.navIconWrap, { backgroundColor: '#FFF4E6' }]}>
              <Zap size={18} color="#E65100" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.navTitle}>Courses disponibles</Text>
              <Text style={styles.navSub}>Consulter et accepter les nouvelles courses</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => router.push('/(tabs)/history')}
          >
            <View style={[styles.navIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Clock size={18} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.navTitle}>Historique des livraisons</Text>
              <Text style={styles.navSub}>Vos courses passées et justificatifs</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => router.push('/(tabs)/earnings')}
          >
            <View style={[styles.navIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Wallet size={18} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.navTitle}>Gains & Retraits</Text>
              <Text style={styles.navSub}>Wave & MTN Mobile Money</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={[styles.navIconWrap, { backgroundColor: '#F3F4F6' }]}>
              <UserCheck size={18} color="#4B5563" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.navTitle}>Mon Profil Livreur</Text>
              <Text style={styles.navSub}>Véhicule, statut CNI, coordonnées</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  unauthContent: {
    paddingBottom: 32,
  },
  unauthHero: {
    paddingTop: spacing[5],
    paddingHorizontal: spacing[4],
    paddingBottom: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
    textAlign: 'center',
  },
  unauthIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  unauthHeroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
  },
  unauthHeroSub: {
    fontSize: 12.5,
    color: '#FFE0B2',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: spacing[2],
  },
  perksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii['2xl'],
    marginHorizontal: spacing[4],
    marginTop: -20,
    padding: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 16,
  },
  perksHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  perkIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  perkDesc: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
  actionButtonsWrap: {
    marginTop: spacing[2],
  },
  quickNavSection: {
    marginTop: spacing[4],
    paddingHorizontal: spacing[4],
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6B7280',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  navIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
  },
  navSub: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 1,
  },
});
