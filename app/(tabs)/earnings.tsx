import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect, useFocusEffect } from 'expo-router';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import {
  usePayoutSettings,
  usePayoutHistory,
  useDriverDailyStats,
  paymentService,
} from '@daloa/api';
import { colors, Button, showAlert } from '@daloa/ui';
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

  const [isRequesting, setIsRequesting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
    }, [refetchStats, refetchPayouts, refetchSettings])
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

  const handleRequestPayout = async () => {
    if (!payoutSettings) {
      showAlert(
        'Numéro Mobile Money requis',
        'Veuillez d’abord enregistrer votre numéro Mobile Money pour recevoir vos gains de livraison.',
        [{ text: 'Configurer', onPress: () => router.push('/payout-setup' as any) }]
      );
      return;
    }

    if (availableBalance <= 0) {
      showAlert(
        'Aucun reliquat à retirer',
        'L’ensemble de vos gains de livraison est déjà transféré ou en cours de versement automatique.'
      );
      return;
    }

    Haptics.success();
    setIsRequesting(true);

    try {
      await paymentService.requestPayout({
        userId: user!.id,
        recipientType: 'driver',
        amount: availableBalance,
        network: payoutSettings.network,
        phone: payoutSettings.phone,
      });

      await Promise.all([refetchStats(), refetchPayouts()]);
      showAlert(
        'Demande de retrait enregistrée ! 🎉',
        `Votre demande de retrait de ${formatFCFA(availableBalance)} a été transmise avec succès.`
      );
    } catch (err: any) {
      showAlert('Erreur', err.message || 'Impossible d’effectuer le retrait.');
    } finally {
      setIsRequesting(false);
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

          {availableBalance > 0 && (
            <View style={{ marginTop: 14 }}>
              <Button
                title={`Retirer le reliquat (${formatFCFA(availableBalance)})`}
                variant="primary"
                size="md"
                loading={isRequesting}
                disabled={isRequesting}
                onPress={handleRequestPayout}
              />
            </View>
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
