import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect, useFocusEffect } from 'expo-router';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import {
  usePayoutSettings,
  usePayoutHistory,
  useDriverDailyStats,
  payoutService,
} from '@daloa/api';
import { getSupportWhatsAppUrl } from '@daloa/config';
import { colors, CodDebtNotice } from '@daloa/ui';
import {
  Wallet,
  ArrowDownRight,
  Clock,
  Smartphone,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  PackageCheck,
  Info,
} from 'lucide-react-native';
import { formatDate, formatFCFA, Haptics } from '@daloa/utils';
import { earningsStyles as styles } from '../../src/components/earnings/earningsStyles';

export default function EarningsScreen() {
  const router = useRouter();
  const { user, driverProfile, isAuthenticated, isLoading: authLoading } = useDriverAuth();

  const { data: payoutSettings, refetch: refetchSettings } = usePayoutSettings(user?.id);
  const { data: payouts, refetch: refetchPayouts } = usePayoutHistory(user?.id, 'delivery');
  const { data: driverStats, refetch: refetchStats } = useDriverDailyStats(driverProfile?.id);

  const [refreshing, setRefreshing] = useState(false);
  // Commission à reverser sur les courses encaissées en espèces (10 % de la
  // course, plus la commission vendeur hors phase 0).
  const [codDebt, setCodDebt] = useState({ count: 0, total: 0 });
  const loadCodDebt = useCallback(async () => {
    if (user?.id) setCodDebt(await payoutService.getOwnCodDebt(user.id));
  }, [user?.id]);

  const earningsToday = driverStats?.earningsToday || 0;
  const completedRunsToday = driverStats?.completedRunsToday || 0;
  const totalLifetimeEarnings = driverStats?.totalLifetimeEarnings || 0;
  const totalCompletedRuns = driverStats?.totalCompletedRuns || 0;
  const pendingEscrow = driverStats?.pendingEscrowAmount || 0;
  const pendingPayoutAmount = driverStats?.pendingPayoutAmount || 0;
  const paidOutAmount = driverStats?.paidOutAmount || 0;
  const availableBalance = driverStats?.totalAvailableBalance || 0;

  // Rechargement immédiat dès que l'écran reprend le focus
  useFocusEffect(
    useCallback(() => {
      refetchStats();
      refetchPayouts();
      refetchSettings();
      loadCodDebt();
    }, [refetchStats, refetchPayouts, refetchSettings, loadCodDebt])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchStats(), refetchPayouts(), refetchSettings()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleBack = () => {
    Haptics.lightImpact();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/livreur');
    }
  };

  const renderPayoutBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return (
          <View style={styles.statusBadgeSuccess}>
            <Text style={styles.statusTextSuccess}>PAYÉ</Text>
          </View>
        );
      case 'pending':
      case 'processing':
        return (
          <View style={styles.statusBadgePending}>
            <Text style={styles.statusTextPending}>EN COURS</Text>
          </View>
        );
      case 'failed':
      default:
        return (
          <View style={styles.statusBadgeFailed}>
            <Text style={styles.statusTextFailed}>ÉCHEC</Text>
          </View>
        );
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color={colors.text.DEFAULT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Portefeuille & Gains</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary.DEFAULT]}
            tintColor={colors.primary.DEFAULT}
          />
        }
      >
        <CodDebtNotice count={codDebt.count} total={codDebt.total} role="delivery" formatAmount={formatFCFA} />
        {/* Alerte Versement en cours si des gains sont en transit */}
        {pendingPayoutAmount > 0 && (
          <View style={styles.pendingAlertCard}>
            <View style={styles.pendingAlertIconWrap}>
              <Clock size={20} color={colors.primary.DEFAULT} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pendingAlertTitle}>
                Versement de {formatFCFA(pendingPayoutAmount)} en cours
              </Text>
              <Text style={styles.pendingAlertSub}>
                Vos gains de course sont en cours de transfert automatique vers votre compte Mobile Money.
              </Text>
            </View>
          </View>
        )}

        {/* Grille Principale des Gains */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiIconWrapper}>
              <TrendingUp size={16} color={colors.primary.DEFAULT} />
            </View>
            <Text style={styles.kpiLabel}>Gains du jour (net)</Text>
            <Text style={styles.kpiValue}>{formatFCFA(earningsToday)}</Text>
            <Text style={styles.kpiSub}>
              {completedRunsToday > 0
                ? `${completedRunsToday} course${completedRunsToday > 1 ? 's' : ''} livrée${completedRunsToday > 1 ? 's' : ''}`
                : 'Aucune course livrée'}
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrapper, { backgroundColor: colors.status.successLight }]}>
              <Wallet size={16} color="#059669" />
            </View>
            <Text style={styles.kpiLabel}>Total gains cumulés</Text>
            <Text style={[styles.kpiValue, { color: '#059669' }]}>
              {formatFCFA(totalLifetimeEarnings)}
            </Text>
            <Text style={styles.kpiSub}>
              {totalCompletedRuns} course{totalCompletedRuns > 1 ? 's' : ''} au total
            </Text>
          </View>
        </View>

        {/* Grille Secondaire : Courses actives & Encaissé */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrapper, { backgroundColor: colors.status.infoLight }]}>
              <Clock size={16} color={colors.categories.electronics.text} />
            </View>
            <Text style={styles.kpiLabel}>Courses en cours</Text>
            <Text style={[styles.kpiValue, { color: colors.categories.electronics.text }]}>
              {formatFCFA(pendingEscrow)}
            </Text>
            <Text style={styles.kpiSub}>En cours d’acheminement</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrapper, { backgroundColor: '#F3F4F6' }]}>
              <PackageCheck size={16} color={colors.grey[700]} />
            </View>
            <Text style={styles.kpiLabel}>Déjà encaissé</Text>
            <Text style={[styles.kpiValue, { color: colors.grey[800] }]}>
              {formatFCFA(paidOutAmount)}
            </Text>
            <Text style={styles.kpiSub}>Transféré sur Mobile Money</Text>
          </View>
        </View>

        {/* Section Compte de Versement */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Compte de versement (Mobile Money)</Text>
          {payoutSettings ? (
            <View style={styles.payoutAccountRow}>
              <View style={styles.payoutAccountIcon}>
                <Smartphone size={18} color={colors.primary.DEFAULT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.networkName}>{payoutSettings.network.toUpperCase()}</Text>
                <Text style={styles.phoneText}>{payoutSettings.phone}</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/payout-setup' as any)}
                style={styles.modifyBtn}
              >
                <Text style={styles.modifyBtnText}>Modifier</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/payout-setup' as any)}
              style={styles.setupPrompt}
            >
              <Text style={styles.setupPromptText}>+ Ajouter un compte Wave, Orange ou MTN</Text>
            </TouchableOpacity>
          )}

          <View style={styles.autoPayoutInfo}>
            <Info size={14} color={colors.grey[500]} />
            <Text style={styles.autoPayoutInfoText}>
              Versements automatiques : vos gains de livraison (90% du prix) sont directement
              transférés vers ce compte dès validation de chaque course.
            </Text>
          </View>

          {/* Pas de retrait manuel : les versements sont automatiques (comme sur
              le site livreur). L'ancien bouton écrivait dans `payouts` des
              colonnes inexistantes, sur une table fermée aux clients : il
              échouait toujours. Un reliquat signale un versement en retard. */}
          {availableBalance > 0 && (
            <TouchableOpacity
              style={[styles.autoPayoutInfo, { marginTop: 14 }]}
              onPress={() =>
                Linking.openURL(
                  getSupportWhatsAppUrl(
                    `Bonjour, j'ai ${formatFCFA(availableBalance)} de gains de livraison non encore versés.`
                  )
                )
              }
            >
              <Info size={14} color={colors.grey[500]} />
              <Text style={styles.autoPayoutInfoText}>
                {formatFCFA(availableBalance)} de gains ne sont pas encore versés. Ils partent
                automatiquement ; sans versement sous 24 h, touchez ici pour prévenir le support.
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Historique des Versements */}
        <Text style={styles.sectionHeading}>Historique des versements</Text>
        <View style={styles.card}>
          {!payouts || payouts.length === 0 ? (
            <View style={styles.emptyPayouts}>
              <Text style={styles.emptyPayoutsText}>Aucun versement de course enregistré pour le moment.</Text>
            </View>
          ) : (
            payouts.map((payout, index) => (
              <View
                key={payout.id}
                style={[styles.payoutItem, index > 0 && styles.payoutItemBorder]}
              >
                <View style={styles.payoutIcon}>
                  <ArrowDownRight size={16} color={colors.primary.DEFAULT} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payoutAmount}>{formatFCFA(payout.amount)}</Text>
                  <Text style={styles.payoutDate}>{formatDate(payout.created_at, true)}</Text>
                </View>
                {renderPayoutBadge(payout.status)}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
