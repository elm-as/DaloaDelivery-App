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
} from '@daloa/ui';
import { Clock, CheckCircle2, Navigation, ChevronRight } from 'lucide-react-native';
import { formatDate, formatFCFA, Haptics } from '@daloa/utils';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historique des Livraisons</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.DEFAULT}
            colors={[colors.primary.DEFAULT]}
          />
        }
      >
        {historyRuns.length === 0 ? (
          <View style={styles.emptyBox}>
            <Clock size={42} color={colors.grey[300]} />
            <Text style={styles.emptyTitle}>Aucune course passée</Text>
            <Text style={styles.emptySub}>
              Vos livraisons terminées et vos gains apparaîtront ici dès que vous aurez complété vos premières courses.
            </Text>
          </View>
        ) : (
          historyRuns.map((run) => {
            const gain = Math.round((run.delivery_price || 500) * 0.9);
            const isDelivered = run.status === 'delivered';

            return (
              <TouchableOpacity
                key={run.id}
                activeOpacity={0.9}
                onPress={() => router.push(`/run/${run.id}` as any)}
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderNumber}>Course #{run.id.slice(0, 8).toUpperCase()}</Text>
                    <Text style={styles.dateText}>{formatDate(run.delivered_at || run.created_at, true)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: isDelivered ? '#ECFDF5' : '#FEF2F2' }]}>
                    <Text style={[styles.statusText, { color: isDelivered ? '#059669' : '#DC2626' }]}>
                      {isDelivered ? 'Livrée' : run.status}
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
                  <Text style={styles.gainLabel}>Gain perçu :</Text>
                  <Text style={styles.gainVal}>{formatFCFA(gain)}</Text>
                </View>
              </TouchableOpacity>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  orderNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
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
    fontWeight: '800',
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
    fontWeight: '700',
    color: colors.grey[500],
    width: 54,
  },
  routeVal: {
    fontSize: 12,
    color: colors.grey[800],
    fontWeight: '600',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  gainLabel: {
    fontSize: 11.5,
    color: colors.grey[600],
    fontWeight: '600',
  },
  gainVal: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary[600],
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12.5,
    color: colors.grey[500],
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
    lineHeight: 17,
  },
});
