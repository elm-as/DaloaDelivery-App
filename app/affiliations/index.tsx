import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
  Avatar,
  EmptyState,
  showAlert,
} from '@daloa/ui';
import { Store, CheckCircle2, Clock, Check, X, Phone, MapPin } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';

export default function DriverAffiliationsScreen() {
  const router = useRouter();
  const { driverProfile } = useDriverAuth();
  const [affiliations, setAffiliations] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAffiliations = useCallback(async () => {
    if (!driverProfile?.id) return;
    try {
      const { data, error } = await supabase
        .from('seller_delivery_affiliations')
        .select(`
          id,
          seller_id,
          delivery_person_id,
          status,
          created_at,
          seller:users!seller_delivery_affiliations_seller_id_fkey (
            id,
            full_name,
            phone,
            shop_name,
            avatar_url,
            shop_logo_url,
            district
          )
        `)
        .eq('delivery_person_id', driverProfile.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAffiliations(data);
      }
    } catch (err) {
      console.warn('Erreur affiliations livreur:', err);
    } finally {
      setRefreshing(false);
    }
  }, [driverProfile?.id]);

  useEffect(() => {
    fetchAffiliations();
  }, [fetchAffiliations]);

  const handleRespond = async (affiliationId: string, status: 'active' | 'rejected') => {
    try {
      Haptics.selection();
      const { error } = await supabase
        .from('seller_delivery_affiliations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', affiliationId);

      if (error) throw error;
      Haptics.success();
      fetchAffiliations();
    } catch (err: any) {
      showAlert('Erreur', err.message || 'Impossible de mettre à jour l’affiliation');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Boutiques Partenaires" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAffiliations();
            }}
            colors={[colors.primary.DEFAULT]}
          />
        }
      >
        <View style={styles.infoBox}>
          <Store size={24} color={colors.primary.DEFAULT} />
          <Text style={styles.infoTitle}>Vos Boutiques Affiliées</Text>
          <Text style={styles.infoSub}>
            Ces commerçants de Daloa vous ont sélectionné comme livreur attitré pour leurs commandes.
          </Text>
        </View>

        {affiliations.length === 0 ? (
          <EmptyState
            icon={<Store size={32} color={colors.primary.DEFAULT} />}
            title="Aucune boutique affiliée"
            description="Proposez aux commerçants de DaloaMarket de vous ajouter dans leurs livreurs dédiés."
          />
        ) : (
          affiliations.map((aff) => {
            const seller = Array.isArray(aff.seller) ? aff.seller[0] : aff.seller;
            const isPending = aff.status === 'pending';
            const isActive = aff.status === 'active';

            return (
              <Card key={aff.id} style={styles.shopCard}>
                <Avatar uri={seller?.shop_logo_url || seller?.avatar_url} name={seller?.shop_name || 'Boutique'} size={48} />
                <View style={styles.shopInfo}>
                  <Text style={styles.shopName}>{seller?.shop_name || seller?.full_name || 'Commerçant'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
                    <Phone size={11} color={colors.grey[500]} />
                    <Text style={styles.shopPhone}>{seller?.phone || 'Téléphone non précisé'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
                    <MapPin size={11} color={colors.grey[500]} />
                    <Text style={styles.shopDistrict}>{seller?.district || 'Daloa'}</Text>
                  </View>
                </View>

                {isActive && <CheckCircle2 size={22} color="#059669" />}

                {isPending && (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      onPress={() => handleRespond(aff.id, 'active')}
                      style={[styles.actionBtn, styles.acceptBtn]}
                    >
                      <Check size={16} color={colors.text.inverse} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRespond(aff.id, 'rejected')}
                      style={[styles.actionBtn, styles.rejectBtn]}
                    >
                      <X size={16} color={colors.status.error} />
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.surface },
  scrollContent: { padding: spacing[4], gap: spacing[3], backgroundColor: colors.bg.DEFAULT },
  infoBox: {
    backgroundColor: colors.bg.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing[4],
    alignItems: 'center',
    gap: spacing[1],
  },
  infoTitle: { color: colors.text.DEFAULT, fontSize: typography.sizes.base, fontFamily: typography.families.bold },
  infoSub: { color: colors.grey[600], fontSize: typography.sizes.xs, textAlign: 'center', lineHeight: 16 },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    gap: spacing[3],
    backgroundColor: colors.bg.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  shopInfo: { flex: 1, gap: 2 },
  shopName: { color: colors.text.DEFAULT, fontSize: typography.sizes.sm, fontFamily: typography.families.bold },
  shopPhone: { color: colors.grey[500], fontSize: typography.sizes.xs },
  shopDistrict: { color: colors.grey[400], fontSize: 11 },
  actionsRow: { flexDirection: 'row', gap: 6 },
  actionBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  acceptBtn: { backgroundColor: '#059669' },
  rejectBtn: { backgroundColor: '#FEE2E2' },
});
