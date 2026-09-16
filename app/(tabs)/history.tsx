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
import { Inbox, Package, RefreshCw, Moon, ChevronRight } from 'lucide-react-native';
import { formatDate, formatFCFA, Haptics } from '@daloa/utils';
import { isCurfewActive } from '../../src/utils/security';

type TabFilter = 'accepted' | 'delivered';

/**
 * Onglet « Livraisons » — reprise de `/livraisons` (DashboardCommandes) du web :
 * deux compteurs, un sélecteur En cours / Livrées, puis la liste filtrée.
 */
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
      {/* En-tête + compteurs */}
      <View style={styles.headerBlock}>
        <View style={styles.headerRow}>
          <View style={styles.flex1}>
            <Text style={styles.headerTitle}>Mes livraisons</Text>
            <Text style={styles.headerSub}>Suivez vos courses en temps réel et validez les OTP</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            activeOpacity={0.8}
            onPress={() => {
              Haptics.lightImpact();
              handleRefresh();
            }}
            accessibilityLabel="Actualiser les commandes"
          >
            <RefreshCw size={16} color={colors.text.body} />
          </TouchableOpacity>
        </View>

        <View style={styles.countersRow}>
          <View style={[styles.counterCard, styles.counterAmber]}>
            <Text style={[styles.counterValue, { color: '#D97706' }]}>{activeRuns.length}</Text>
            <Text style={[styles.counterLabel, { color: '#92400E' }]}>En cours de livraison</Text>
          </View>
          <View style={[styles.counterCard, styles.counterEmerald]}>
            <Text style={[styles.counterValue, { color: '#059669' }]}>{historyRuns.length}</Text>
            <Text style={[styles.counterLabel, { color: '#065F46' }]}>Courses terminées</Text>
          </View>
        </View>
      </View>

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
        {/* Sélecteur En cours / Livrées */}
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
            <Moon size={22} color="#FBBF24" />
            <View style={styles.flex1}>
              <Text style={styles.curfewTitle}>Couvre-feu de sécurité (22h30 — 05h30)</Text>
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
          filteredRuns.map((run) => {
            const isDelivered = run.status === 'delivered';
            const gain = Math.round((Number(run.delivery_price) || 0) * 0.9);

            return (
              <TouchableOpacity
                key={run.id}
                activeOpacity={0.9}
                onPress={() => router.push(`/run/${run.id}` as any)}
                style={[styles.card, isInProgressTab && styles.cardActive]}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderNumber}>Course #{run.id.slice(0, 8).toUpperCase()}</Text>
                    <Text style={styles.dateText}>
                      {formatDate(run.delivered_at || run.created_at, true)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isInProgressTab
                          ? colors.primary[50]
                          : isDelivered
                            ? colors.status.successLight
                            : colors.status.errorLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: isInProgressTab
                            ? colors.primary[700]
                            : isDelivered
                              ? colors.status.successDark
                              : colors.status.errorDark,
                        },
                      ]}
                    >
                      {isInProgressTab
                        ? run.status === 'picked_up' || run.status === 'in_transit'
                          ? 'En route'
                          : 'À ramasser'
                        : isDelivered
                          ? 'Livrée'
                          : run.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.routeRow}>
                  <View style={styles.routeCol}>
                    <Text style={styles.routeLabel}>Départ :</Text>
                    <Text numberOfLines={1} style={styles.routeVal}>{run.pickup_location || 'Daloa'}</Text>
                  </View>
                  <View style={styles.routeCol}>
                    <Text style={styles.routeLabel}>Arrivée :</Text>
                    <Text numberOfLines={1} style={styles.routeVal}>{run.dropoff_location || 'Daloa'}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  {isInProgressTab ? (
                    <>
                      <Text style={styles.gainLabel}>Continuer la course</Text>
                      <ChevronRight size={18} color={colors.primary.DEFAULT} />
                    </>
                  ) : (
                    <>
                      <Text style={styles.gainLabel}>Gain perçu :</Text>
                      <Text style={styles.gainVal}>{formatFCFA(gain)}</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.DEFAULT,
  },
  flex1: { flex: 1 },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.surface,
  },
  headerBlock: {
    backgroundColor: colors.bg.surface,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 19,
    fontFamily: typography.families.black,
    color: colors.text.DEFAULT,
  },
  headerSub: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.grey[50],
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  countersRow: {
    flexDirection: 'row',
    gap: 10,
  },
  counterCard: {
    flex: 1,
    borderRadius: radii['2xl'],
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  counterAmber: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  counterEmerald: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  counterValue: {
    fontSize: 26,
    fontFamily: typography.families.black,
    lineHeight: 28,
  },
  counterLabel: {
    fontSize: 9.5,
    fontFamily: typography.families.black,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 5,
  },
  scrollContent: {
    padding: 14,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.grey[200],
    borderRadius: radii.xl,
    padding: 4,
    marginBottom: 14,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
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
  },
  segmentedCountTextActive: {
    color: colors.text.inverse,
  },
  curfewCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#0F172A',
    borderRadius: radii['2xl'],
    padding: 16,
    borderWidth: 1,
    borderColor: '#312E81',
  },
  curfewTitle: {
    fontSize: 14,
    fontFamily: typography.families.black,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  curfewSub: {
    fontSize: 12,
    color: '#CBD5E1',
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
    backgroundColor: colors.grey[50],
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
    paddingVertical: 10,
    borderRadius: radii.lg,
    backgroundColor: colors.grey[100],
  },
  emptyBtnText: {
    fontSize: 12,
    fontFamily: typography.families.extrabold,
    color: colors.text.body,
  },
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: 14,
    marginBottom: 12,
  },
  cardActive: {
    borderColor: colors.primary[200],
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[50],
  },
  orderNumber: {
    fontSize: 13,
    fontFamily: typography.families.extrabold,
    color: colors.text.DEFAULT,
  },
  dateText: {
    fontSize: 11,
    color: colors.grey[400],
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  statusText: {
    fontSize: 10.5,
    fontFamily: typography.families.extrabold,
  },
  routeRow: {
    marginVertical: 10,
    gap: 4,
  },
  routeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeLabel: {
    fontSize: 11.5,
    fontFamily: typography.families.bold,
    color: colors.grey[500],
    width: 54,
  },
  routeVal: {
    fontSize: 12,
    color: colors.grey[800],
    fontFamily: typography.families.semibold,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.grey[50],
  },
  gainLabel: {
    fontSize: 11.5,
    color: colors.grey[600],
    fontFamily: typography.families.semibold,
  },
  gainVal: {
    fontSize: 14,
    fontFamily: typography.families.black,
    color: colors.primary[600],
  },
});
