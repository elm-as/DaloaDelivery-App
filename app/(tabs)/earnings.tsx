import React, { useState } from 'react';
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
import { usePayoutSettings, usePayoutHistory, paymentService } from '@daloa/api';
import {
  colors,
  radii,
  spacing,
  typography,
  Header,
  StatCard,
  Card,
  Button,
  CurrencyText,
  StatusPill,
} from '@daloa/ui';
import { Wallet, ArrowDownRight, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { formatDate, Haptics } from '@daloa/utils';

export default function EarningsScreen() {
  const router = useRouter();
  const { user } = useDriverAuth();

  const { data: payoutSettings } = usePayoutSettings(user?.id);
  const { data: payouts, refetch } = usePayoutHistory(user?.id);

  const [isRequesting, setIsRequesting] = useState(false);

  // Gains simulés livreur
  const availableBalance = 28500;
  const pendingEscrow = 6500;

  const handleRequestPayout = async () => {
    if (!payoutSettings) {
      Alert.alert(
        'Numéro Mobile Money requis',
        'Veuillez d’abord configurer votre compte Mobile Money pour recevoir vos gains de livraison.',
        [{ text: 'Configurer', onPress: () => router.push('/payout-setup') }]
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

      refetch();
      Alert.alert('Retrait en cours !', 'Votre demande de retrait de 28 500 FCFA a été envoyée. Vos fonds vous parviendront sous 24h.');
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible d’effectuer le retrait.');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Portefeuille & Gains" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* KPI Row */}
        <View style={styles.kpiRow}>
          <StatCard
            label="Gains disponibles"
            value={availableBalance}
            isCurrency
            currencyColor={colors.delivery.primary}
            icon={<Wallet size={16} color={colors.delivery.primary} />}
          />
          <StatCard
            label="En attente séquestre"
            value={pendingEscrow}
            isCurrency
            currencyColor="#F59E0B"
            icon={<Clock size={16} color="#F59E0B" />}
          />
        </View>

        {/* Compte de Versement */}
        <Card style={styles.card}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.cardTitle}>Compte de paiement Mobile Money</Text>
              <Text style={styles.cardSub}>
                {payoutSettings
                  ? `${payoutSettings.network.toUpperCase()} • ${payoutSettings.phone}`
                  : 'Aucun compte configuré'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/payout-setup')}
              style={styles.configBtn}
            >
              <Text style={styles.configBtnText}>Modifier</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Retirer mes gains (Mobile Money)"
            variant="delivery"
            size="lg"
            disabled={availableBalance <= 0 || isRequesting}
            loading={isRequesting}
            onPress={handleRequestPayout}
            leftIcon={<ArrowDownRight size={18} color="#090D16" />}
            style={{ marginTop: spacing[3] }}
          />
        </Card>

        {/* Historique Payouts */}
        <Text style={styles.sectionTitle}>Historique des virements</Text>
        {!payouts || payouts.length === 0 ? (
          <Card style={{ padding: spacing[4], alignItems: 'center' }}>
            <Text style={{ color: colors.dark.textMuted, fontSize: typography.sizes.xs }}>
              Aucun virement pour le moment.
            </Text>
          </Card>
        ) : (
          payouts.map((p) => (
            <Card key={p.id} style={styles.payoutCard}>
              <View>
                <Text style={styles.payoutNet}>{p.network.toUpperCase()} • {p.phone}</Text>
                <Text style={styles.payoutDate}>{formatDate(p.created_at, true)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <CurrencyText amount={p.net_amount} size="base" weight="bold" color={colors.delivery.primary} />
                <StatusPill status={p.status} size="sm" />
              </View>
            </Card>
          ))
        )}

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
  scrollContent: {
    padding: spacing[4],
    gap: spacing[4],
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  card: {
    padding: spacing[4],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: colors.dark.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  cardSub: {
    color: colors.dark.textDim,
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  configBtn: {
    backgroundColor: colors.dark.surfaceRaised,
    paddingHorizontal: spacing[3],
    paddingVertical: 5,
    borderRadius: radii.md,
  },
  configBtnText: {
    color: colors.delivery.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  sectionTitle: {
    color: colors.dark.text,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  payoutNet: {
    color: colors.dark.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  payoutDate: {
    color: colors.dark.textDim,
    fontSize: 11,
  },
});
