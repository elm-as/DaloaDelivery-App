import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@daloa/api';
import {
  colors,
  radii,
  spacing,
  typography,
  Header,
  Card,
  Avatar,
  RatingStars,
  Badge,
  SearchInput,
  EmptyState,
} from '@daloa/ui';
import { PhoneCall, Bike } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';

export default function DeliverersDirectoryScreen() {
  const router = useRouter();
  const [deliverers, setDeliverers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeliverers() {
      try {
        const { data } = await supabase
          .from('delivery_persons')
          .select('*')
          .order('rating', { ascending: false });
        setDeliverers(data || []);
      } finally {
        setLoading(false);
      }
    }
    fetchDeliverers();
  }, []);

  const filtered = deliverers.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.vehicle_type?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCall = (phone: string) => {
    Haptics.lightImpact();
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Annuaire des Livreurs" onBack={() => router.back()} />

      <View style={styles.searchBar}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un livreur par nom ou moto..."
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Bike size={32} color={colors.primary.DEFAULT} />}
            title="Aucun livreur trouvé"
            description="Essayez un autre mot-clé."
          />
        ) : (
          filtered.map((d) => (
            <Card
              key={d.id}
              onPress={() => router.push(`/directory/${d.id}` as any)}
              style={styles.driverCard}
            >
              <Avatar uri={d.photo_url} name={d.name} size={50} />

              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>{d.name}</Text>
                  {d.is_verified && <Badge label="VÉRIFIÉ" variant="verified" size="sm" />}
                </View>

                <Text style={styles.vehicle}>🛵 {d.vehicle_type?.toUpperCase() || 'MOTO'}</Text>
                <RatingStars rating={d.rating || 5.0} totalReviews={d.total_reviews || 0} size={11} />
              </View>

              <TouchableOpacity
                onPress={() => handleCall(d.phone)}
                style={styles.callBtn}
              >
                <PhoneCall size={16} color={colors.primary.DEFAULT} />
              </TouchableOpacity>
            </Card>
          ))
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
  searchBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[2],
    backgroundColor: '#F8F9FA',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    gap: spacing[3],
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    color: '#111827',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  vehicle: {
    color: colors.primary[700],
    fontSize: 11,
    fontWeight: typography.weights.medium,
  },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.lg,
    backgroundColor: '#FFF4E6',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
