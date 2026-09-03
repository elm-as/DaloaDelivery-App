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
  Button,
} from '@daloa/ui';
import { Wallet, ArrowDownRight, Clock, ShieldCheck, CheckCircle2, Smartphone, ChevronRight } from 'lucide-react-native';
import { formatDate, formatFCFA, Haptics } from '@daloa/utils';

export default function EarningsScreen() {
  const router = useRouter();
  const { user } = useDriverAuth();

  const { data: payoutSettings } = usePayoutSettings(user?.id);
  const { data: payouts, refetch } = usePayoutHistory(user?.id);

  const [isRequesting, setIsRequesting] = useState(false);

  const availableBalance = 28500;
  const pendingEscrow = 6500;

  const handleRequestPayout = async () => {
    if (!payoutSettings) {
      Alert.alert(
        'Numéro Mobile Money requis',
        'Veuillez d’abord enregistrer votre numéro Mobile Money pour recevoir vos gains de livraison.',
        [{ text: 'Configurer', onPress: () => router.push('/payout-setup' as any) }]
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
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
            <View style={[styles.kpiIconWrapper, { backgroundColor: '#FFFBEB' }]}>
              <Clock size={16} color="#D97706" />
            </View>
            <Text style={styles.kpiLabel}>En attente séquestre</Text>
            <Text style={[styles.kpiValue, { color: '#D97706' }]}>{formatFCFA(pendingEscrow)}</Text>
          </View>
        </View>

        {/* Compte de Versement */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Compte de paiement Mobile Money</Text>
          {payoutSettings ? (
            <View style={styles.payoutAccountRow}>
              <View style={styles.payoutAccountIcon}>
                <Smartphone size={20} color={colors.primary.DEFAULT} />
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
              <Text style={styles.setupPromptText}>
                + Configurer mon numéro Wave / Orange / MTN / Moov
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ marginTop: 14 }}>
            <Button
              title={`Demander un retrait (${formatFCFA(availableBalance)})`}
              variant="primary"
              size="lg"
              onPress={handleRequestPayout}
              loading={isRequesting}
              disabled={availableBalance <= 0}
              fullWidth
            />
          </View>
        </View>

        {/* Historique des Retraits */}
        <Text style={styles.sectionHeading}>Historique des Retraits</Text>
        <View style={styles.card}>
          {payouts && payouts.length > 0 ? (
            payouts.map((p: any, idx: number) => (
              <View key={p.id} style={[styles.payoutItem, idx > 0 && styles.payoutItemBorder]}>
                <View style={styles.payoutIcon}>
                  <ArrowDownRight size={16} color={colors.primary.DEFAULT} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payoutAmount}>{formatFCFA(p.amount)}</Text>
                  <Text style={styles.payoutDate}>{formatDate(p.created_at)}</Text>
                </View>
                <View style={styles.payoutStatusBadge}>
                  <Text style={styles.payoutStatusText}>{p.status}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyPayouts}>
              <Text style={styles.emptyPayoutsText}>Aucun retrait effectué pour le moment.</Text>
            </View>
          )}
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
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  kpiIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: radii.md,
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.grey[500],
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary[600],
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  payoutAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: radii.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  payoutAccountIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  phoneText: {
    fontSize: 11.5,
    color: colors.grey[500],
  },
  modifyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modifyBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.grey[700],
  },
  setupPrompt: {
    padding: 12,
    backgroundColor: '#FFF4E6',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  setupPromptText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.primary[700],
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.grey[600],
    marginBottom: 8,
    marginLeft: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  payoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  payoutItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  payoutIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutAmount: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
  },
  payoutDate: {
    fontSize: 11,
    color: colors.grey[400],
  },
  payoutStatusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  payoutStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
  },
  emptyPayouts: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyPayoutsText: {
    fontSize: 12.5,
    color: colors.grey[400],
  },
});
