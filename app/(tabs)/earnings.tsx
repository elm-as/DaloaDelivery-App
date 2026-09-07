import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect } from 'expo-router';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { usePayoutSettings, usePayoutHistory, useDriverDailyStats, paymentService } from '@daloa/api';
import {
  colors,
  Button,
} from '@daloa/ui';
import { Wallet, ArrowDownRight, Clock, ShieldCheck, CheckCircle2, Smartphone, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { formatDate, formatFCFA, Haptics } from '@daloa/utils';
import { earningsStyles as styles } from '../../src/components/earnings/earningsStyles';

export default function EarningsScreen() {
  const router = useRouter();
  const { user, driverProfile, isAuthenticated, isLoading: authLoading } = useDriverAuth();

  const { data: payoutSettings } = usePayoutSettings(user?.id);
  const { data: payouts, refetch } = usePayoutHistory(user?.id);
  const { data: driverStats } = useDriverDailyStats(driverProfile?.id);

  const [isRequesting, setIsRequesting] = useState(false);

  const availableBalance = driverStats?.totalAvailableBalance || 0;
  const pendingEscrow = driverStats?.pendingEscrowAmount || 0;

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
      Alert.alert(
        'Numéro Mobile Money requis',
        'Veuillez d’abord enregistrer votre numéro Mobile Money pour recevoir vos gains de livraison.',
        [{ text: 'Configurer', onPress: () => router.push('/payout-setup' as any) }]
      );
      return;
    }

    if (availableBalance <= 0) {
      Alert.alert('Solde insuffisant', 'Vous n’avez aucun gain disponible à retirer actuellement.');
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

      refetch();
      Alert.alert(
        'Demande de retrait enregistrée ! 🎉',
        `Votre demande de retrait de ${formatFCFA(availableBalance)} a été transmise avec succès.`
      );
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible d’effectuer le retrait.');
    } finally {
      setIsRequesting(false);
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#FF6B00" />
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
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Portefeuille & Gains</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* KPI Row */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiIconWrapper}>
              <Wallet size={16} color={colors.primary.DEFAULT} />
            </View>
            <Text style={styles.kpiLabel}>Gains disponibles</Text>
            <Text style={styles.kpiValue}>{formatFCFA(availableBalance)}</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrapper, { backgroundColor: '#EFF6FF' }]}>
              <Clock size={16} color="#2563EB" />
            </View>
            <Text style={styles.kpiLabel}>Courses en cours</Text>
            <Text style={[styles.kpiValue, { color: '#2563EB' }]}>{formatFCFA(pendingEscrow)}</Text>
          </View>
        </View>

        {/* Section Compte de Retrait */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Compte de versement (Mobile Money)</Text>
          {payoutSettings ? (
            <View style={styles.payoutAccountRow}>
              <View style={styles.payoutAccountIcon}>
                <Smartphone size={18} color="#FF6B00" />
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
              <Text style={styles.setupPromptText}>+ Ajouter un compte Wave ou MTN</Text>
            </TouchableOpacity>
          )}

          <View style={{ marginTop: 14 }}>
            <Button
              title="Demander mon virement"
              variant="primary"
              size="md"
              loading={isRequesting}
              disabled={isRequesting || availableBalance <= 0}
              onPress={handleRequestPayout}
            />
          </View>
        </View>

        {/* Historique des Retraits */}
        <Text style={styles.sectionHeading}>Historique des versements</Text>
        <View style={styles.card}>
          {!payouts || payouts.length === 0 ? (
            <View style={styles.emptyPayouts}>
              <Text style={styles.emptyPayoutsText}>Aucun versement effectué pour le moment.</Text>
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
                <View style={styles.payoutStatusBadge}>
                  <Text style={styles.payoutStatusText}>{payout.status.toUpperCase()}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
