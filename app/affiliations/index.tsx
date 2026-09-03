import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
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
  Avatar,
  EmptyState,
} from '@daloa/ui';
import { Store, CheckCircle2 } from 'lucide-react-native';

export default function DriverAffiliationsScreen() {
  const router = useRouter();
  const { driverProfile } = useDriverAuth();
  const [shops, setShops] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAffiliatedShops() {
      if (!driverProfile?.id) return;
      const { data } = await supabase
        .from('seller_deliverers')
        .select('*, sellers:seller_id(*)')
        .eq('delivery_person_id', driverProfile.id);
      setShops(data || []);
    }
    fetchAffiliatedShops();
  }, [driverProfile?.id]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Boutiques Partenaires" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBox}>
          <Store size={24} color={colors.primary.DEFAULT} />
          <Text style={styles.infoTitle}>Vos Boutiques Affiliées</Text>
          <Text style={styles.infoSub}>
            Ces commerçants de Daloa vous ont sélectionné comme livreur attitré pour leurs commandes.
          </Text>
        </View>

        {shops.length === 0 ? (
          <EmptyState
            icon={<Store size={32} color={colors.primary.DEFAULT} />}
            title="Aucune boutique affiliée"
            description="Proposez aux commerçants de DaloaMarket de vous ajouter dans leurs livreurs dédiés."
          />
        ) : (
          shops.map((aff) => {
            const seller = aff.sellers;
            return (
              <Card key={aff.id} style={styles.shopCard}>
                <Avatar uri={seller?.shop_logo_url} name={seller?.shop_name || 'Boutique'} size={48} />
                <View style={styles.shopInfo}>
                  <Text style={styles.shopName}>{seller?.shop_name || seller?.full_name}</Text>
                  <Text style={styles.shopPhone}>{seller?.phone}</Text>
                  <Text style={styles.shopDistrict}>📍 {seller?.district || 'Daloa'}</Text>
                </View>
                <CheckCircle2 size={20} color="#059669" />
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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[3],
    backgroundColor: '#F8F9FA',
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: spacing[4],
    alignItems: 'center',
    gap: spacing[1],
  },
  infoTitle: {
    color: '#111827',
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  infoSub: {
    color: colors.grey[600],
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    gap: spacing[3],
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shopInfo: {
    flex: 1,
    gap: 2,
  },
  shopName: {
    color: '#111827',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  shopPhone: {
    color: colors.grey[500],
    fontSize: typography.sizes.xs,
  },
  shopDistrict: {
    color: colors.grey[400],
    fontSize: 11,
  },
});
