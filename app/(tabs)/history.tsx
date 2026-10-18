import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect } from 'expo-router';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { supabase } from '@daloa/api';
import { colors, radii, typography } from '@daloa/ui';
import { Inbox, Package, RefreshCw, Moon } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';
import { isCurfewActive } from '../../src/utils/security';
import { HistoryCountersHeader } from '../../src/components/history/HistoryCountersHeader';
import { HistoryRunCard } from '../../src/components/history/HistoryRunCard';

type TabFilter = 'accepted' | 'delivered';

export default function HistoryScreen() {
  const router = useRouter();
  const { driverProfile, isAuthenticated, isLoading: authLoading } = useDriverAuth();
  const [activeRuns, setActiveRuns] = useState<any[]>([]);
  const [historyRuns, setHistoryRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabFilter>('accepted');

  const fetchHistory = async () => {
    if (!driverProfile?.id) return;
    try {
      const select = '*, orders:order_id(id, listings:listing_id(title))';

      const [enCours, terminees] = await Promise.all([
        supabase
          .from('delivery_assignments')
          .select(select)
          .eq('delivery_person_id', driverProfile.id)
          .in('status', ['pending_seller_confirmation', 'awaiting_pickup', 'accepted', 'picked_up', 'in_transit'])
          .order('created_at', { ascending: false }),
        supabase
          .from('delivery_assignments')
          .select(select)
          .eq('delivery_person_id', driverProfile.id)
          .in('status', ['delivered', 'auto_released', 'disputed', 'cancelled'])
          .order('created_at', { ascending: false }),
      ]);

      if (enCours.error) throw enCours.error;
      if (terminees.error) throw terminees.error;
      setActiveRuns(enCours.data || []);
      setHistoryRuns(terminees.data || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [driverProfile?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  if (authLoading || loading) {
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

  const filteredRuns = activeTab === 'accepted' ? activeRuns : historyRuns;
  const isInProgressTab = activeTab === 'accepted';

  const tabs: { key: TabFilter; label: string; icon: any; count: number }[] = [
    { key: 'accepted', label: 'En cours', icon: Inbox, count: activeRuns.length },
    { key: 'delivered', label: 'Livrées', icon: Package, count: historyRuns.length },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HistoryCountersHeader
        activeCount={activeRuns.length}
        historyCount={historyRuns.length}
        onRefresh={handleRefresh}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.DEFAULT}
            colors={[colors.primary.DEFAULT]}
          />
        }
      >
        <View style={styles.segmented}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.85}
                onPress={() => {
                  Haptics.selection();
                  setActiveTab(tab.key);
                }}
                style={[styles.segmentedItem, isCurrent && styles.segmentedItemActive]}
                accessibilityRole="button"
                accessibilityLabel={`${tab.label} (${tab.count})`}
              >
                <Icon size={15} color={isCurrent ? colors.primary[700] : colors.text.muted} />
                <Text style={[styles.segmentedText, isCurrent && styles.segmentedTextActive]}>
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View style={[styles.segmentedCount, isCurrent && styles.segmentedCountActive]}>
                    <Text style={[styles.segmentedCountText, isCurrent && styles.segmentedCountTextActive]}>
                      {tab.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {isCurfewActive() && !isInProgressTab ? (
          <View style={styles.curfewCard}>
            <Moon size={22} color={colors.status.warning} />
            <View style={styles.flex1}>
              <Text style={styles.curfewTitle}>Couvre-feu de sécurité (22h30 à 05h30)</Text>
              <Text style={styles.curfewSub}>
                Les nouvelles livraisons sont suspendues durant la nuit pour votre sécurité. Vous pouvez toujours clôturer vos courses en cours.
              </Text>
            </View>
          </View>
        ) : filteredRuns.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              {isInProgressTab ? (
                <Inbox size={30} color={colors.grey[300]} />
              ) : (
                <Package size={30} color={colors.grey[300]} />
              )}
            </View>
            <Text style={styles.emptyTitle}>
              {isInProgressTab ? 'Aucune livraison en cours' : 'Aucune course terminée'}
            </Text>
            <Text style={styles.emptySub}>
              {isInProgressTab
                ? 'Les livraisons que vous acceptez dans le flux des courses apparaîtront ici pour la validation OTP.'
                : "L'historique complet de vos livraisons effectuées apparaîtra ici."}
            </Text>
            <TouchableOpacity style={styles.emptyBtn} activeOpacity={0.8} onPress={handleRefresh}>
              <RefreshCw size={13} color={colors.text.body} />
              <Text style={styles.emptyBtnText}>Actualiser</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredRuns.map((run) => (
            <HistoryRunCard
              key={run.id}
              run={run}
              isInProgressTab={isInProgressTab}
              onPress={() => router.push(`/run/${run.id}` as any)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.surface,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.surface,
  },
  scrollContent: {
    padding: 14,
    backgroundColor: colors.bg.DEFAULT,
    minHeight: '100%',
  },
  flex1: {
    flex: 1,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.bg.subtle,
    borderRadius: radii.xl,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  segmentedItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radii.lg,
  },
  segmentedItemActive: {
    backgroundColor: colors.bg.surface,
    elevation: 1,
  },
  segmentedText: {
    fontSize: 12,
    fontFamily: typography.families.extrabold,
    color: colors.text.muted,
  },
  segmentedTextActive: {
    color: colors.primary[700],
  },
  segmentedCount: {
    backgroundColor: colors.grey[300],
    borderRadius: radii.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  segmentedCountActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  segmentedCountText: {
    fontSize: 10,
    fontFamily: typography.families.black,
    color: colors.grey[700],
    fontVariant: ['tabular-nums'],
  },
  segmentedCountTextActive: {
    color: colors.text.inverse,
  },
  curfewCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.bg.surface,
    borderRadius: radii['2xl'],
    padding: 16,
    borderWidth: 1,
    borderColor: colors.status.warningBorder,
  },
  curfewTitle: {
    fontSize: 14,
    fontFamily: typography.families.black,
    color: colors.text.DEFAULT,
    marginBottom: 4,
  },
  curfewSub: {
    fontSize: 12,
    fontFamily: typography.families.normal,
    color: colors.text.muted,
    lineHeight: 17,
  },
  emptyCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: radii['2xl'],
    paddingVertical: 36,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border.subtle,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: radii.xl,
    backgroundColor: colors.bg.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: typography.families.black,
    color: colors.text.DEFAULT,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    fontFamily: typography.families.normal,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 17,
  },
  emptyBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: colors.bg.subtle,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  emptyBtnText: {
    fontSize: 12,
    fontFamily: typography.families.bold,
    color: colors.text.body,
  },
});
