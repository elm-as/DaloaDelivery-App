import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { supabase } from '@daloa/api';
import {
  colors,
  radii,
  spacing,
  typography,
  Header,
  Card,
  StatusPill,
  CurrencyText,
  EmptyState,
} from '@daloa/ui';
import { Clock, CheckCircle2, Navigation } from 'lucide-react-native';
import { formatDate } from '@daloa/utils';

export default function HistoryScreen() {
  const router = useRouter();
  const { driverProfile } = useDriverAuth();
  const [historyRuns, setHistoryRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    if (!driverProfile?.id) return;
    try {
      const { data, error } = await supabase
        .from('delivery_assignments')
        .select('*, orders:order_id(id, listings:listing_id(title))')
        .eq('delivery_person_id', driverProfile.id)
        .in('status', ['delivered', 'disputed', 'cancelled'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistoryRuns(data || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [driverProfile?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Historique des Livraisons" onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.delivery.primary}
          />
        }
      >
        {historyRuns.length === 0 ? (
          <EmptyState
            icon={<Clock size={32} color={colors.delivery.primary} />}
            title="Aucune course passée"
            description="Vos livraisons terminées et vos gains apparaîtront ici."
          />
        ) : (
          historyRuns.map((run) => {
            const gain = (run.delivery_price || 0) - (run.driver_fee || 0);
            return (
              <Card
                key={run.id}
                onPress={() => router.push(`/run/${run.id}`)}
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderNumber}>Course #{run.id.slice(0, 8).toUpperCase()}</Text>
                    <Text style={styles.dateText}>{formatDate(run.delivered_at || run.created_at, true)}</Text>
                  </View>
                  <StatusPill status={run.status} size="sm" />
                </View>

                <View style={styles.routeRow}>
                  <Text style={styles.districtText}>
                    📍 {run.pickup_location} ➔ {run.dropoff_location}
                  </Text>
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    📦 {run.orders?.listings?.title || 'Colis DaloaMarket'}
                  </Text>
                  <CurrencyText
                    amount={gain}
                    size="base"
                    weight="bold"
                    color={colors.delivery.primary}
                  />
                </View>
              </Card>
            );
          })
        )}
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
    gap: spacing[3],
  },
  card: {
    padding: spacing[3] + 2,
    gap: spacing[2],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
    paddingBottom: spacing[2],
  },
  orderNumber: {
    color: colors.dark.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  dateText: {
    color: colors.dark.textDim,
    fontSize: 11,
    marginTop: 1,
  },
  routeRow: {
    marginVertical: 2,
  },
  districtText: {
    color: colors.dark.textMuted,
    fontSize: typography.sizes.xs,
    lineHeight: 16,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    paddingTop: spacing[2],
  },
  itemTitle: {
    color: colors.dark.textDim,
    fontSize: typography.sizes.xs,
    flex: 1,
    marginRight: spacing[2],
  },
});
