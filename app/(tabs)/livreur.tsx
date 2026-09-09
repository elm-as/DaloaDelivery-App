import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bike, Zap, Clock, Wallet, UserCheck, Shield, ChevronRight, Moon, AlertTriangle, ShieldCheck,
} from 'lucide-react-native';
import { Button } from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import { useActiveDriverRun, useDriverDailyStats, useAvailableRuns } from '@daloa/api';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { DeliveryTopBar } from '../../src/components/DeliveryTopBar';
import { DriverHeroHeader } from '../../src/components/DriverHeroHeader';
import { DriverStatsRow } from '../../src/components/DriverStatsRow';
import { styles } from '../../src/components/livreur/livreurStyles';
import { isCurfewActive } from '../../src/utils/security';

export default function LivreurTabScreen() {
  const router = useRouter();
  const { driverProfile, isOnline, toggleOnlineStatus, isAuthenticated, isAdmin, driverLocation } = useDriverAuth();

  // Si administrateur connecté sans profil livreur, redirection automatique
  if (isAuthenticated && isAdmin && !driverProfile) {
    return <Redirect href="/admin" />;
  }

  const { data: activeRun, refetch: refetchActiveRun } = useActiveDriverRun(driverProfile?.id);
  const { data: stats, refetch: refetchStats, isRefetching } = useDriverDailyStats(driverProfile?.id);
  const { data: availableRuns, refetch: refetchRuns } = useAvailableRuns(driverLocation, isOnline);

  const handleRefresh = async () => {
    await Promise.all([refetchActiveRun(), refetchStats(), refetchRuns()]);
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.unauthContent}>
          <LinearGradient
            colors={['#FFA726', '#FF9800', '#E65100']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.unauthHero}
          >
            <View style={styles.unauthIconCircle}>
              <Bike size={32} color="#E65100" />
            </View>
            <Text style={styles.unauthHeroTitle}>Rejoignez la flotte{'\n'}DaloaDelivery</Text>
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

        {/* Accès direct Admin si l'utilisateur a le rôle admin */}
        {isAdmin && (
          <TouchableOpacity
            style={styles.adminBanner}
            onPress={() => {
              Haptics.selection();
              router.push('/admin' as any);
            }}
          >
            <ShieldCheck size={22} color="#1E40AF" />
            <View style={{ flex: 1 }}>
              <Text style={styles.adminBannerTitle}>Panneau d'Administration</Text>
              <Text style={styles.adminBannerSub}>Validation des livreurs & litiges</Text>
            </View>
            <ChevronRight size={18} color="#1E40AF" />
          </TouchableOpacity>
        )}

        {/* Alerte Sécurité Nocturne Couvre-feu (22h30 - 05h30) */}
        {isCurfewActive() && (
          <View style={styles.curfewCard}>
            <Moon size={22} color="#FBBF24" />
            <View style={{ flex: 1 }}>
              <Text style={styles.curfewTitle}>Sécurité Nocturne Active</Text>
              <Text style={styles.curfewSub}>
                Attribution des courses suspendue entre 22h30 et 05h30 pour votre sécurité.
              </Text>
            </View>
          </View>
        )}

        {/* Alerte Mode de Retrait Wave / MTN manquant */}
        {driverProfile && (!driverProfile.payout_network || !driverProfile.payout_number) && (
          <View style={styles.payoutWarningCard}>
            <AlertTriangle size={22} color="#B45309" />
            <View style={{ flex: 1 }}>
              <Text style={styles.payoutWarningTitle}>Mode de retrait non configuré</Text>
              <Text style={styles.payoutWarningSub}>
                Renseignez votre compte Wave ou MTN pour recevoir automatiquement vos gains.
              </Text>
              <TouchableOpacity
                style={styles.payoutWarningBtn}
                onPress={() => router.push('/payout-setup' as any)}
              >
                <Text style={styles.payoutWarningBtnText}>Configurer mon retrait Wave / MTN</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Alerte si le compte utilisateur est connecté mais sans profil livreur */}
        {!driverProfile && !isAdmin && (
          <View style={styles.missingProfileCard}>
            <Text style={styles.missingProfileTitle}>Finalisez votre inscription livreur</Text>
            <Text style={styles.missingProfileSub}>
              Vous êtes connecté à DaloaDelivery. Complétez vos informations de véhicule et Mobile Money pour commencer à livrer.
            </Text>
            <Button
              title="Compléter ma fiche livreur"
              variant="primary"
              size="sm"
              onPress={() => router.push('/auth/register' as any)}
              style={styles.missingProfileBtn}
            />
          </View>
        )}

        <DriverStatsRow
          earningsToday={stats?.earningsToday || 0}
          completedRunsToday={stats?.completedRunsToday || 0}
          rating={driverProfile?.rating || 5.0}
          onPressEarnings={() => router.push('/(tabs)/earnings')}
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
              <Text style={styles.navSub}>
                {availableRuns && availableRuns.length > 0
                  ? `${availableRuns.length} course(s) en attente`
                  : 'Consulter et accepter les nouvelles courses'}
              </Text>
            </View>
            {availableRuns && availableRuns.length > 0 ? (
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>{availableRuns.length}</Text>
              </View>
            ) : (
              <ChevronRight size={18} color="#9CA3AF" />
            )}
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
