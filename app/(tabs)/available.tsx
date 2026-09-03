import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { useAvailableRuns, deliveryService } from '@daloa/api';
import { AvailableDeliveryRun } from '@daloa/types';
import {
  colors,
  radii,
  spacing,
  typography,
  DeliveryOrderCard,
  Skeleton,
  Button,
} from '@daloa/ui';
import { Zap, AlertCircle } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';

export default function AvailableRunsScreen() {
  const router = useRouter();
  const { driverProfile, isOnline, driverLocation, toggleOnlineStatus } = useDriverAuth();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const { data: runs, isLoading, refetch, isRefetching } = useAvailableRuns(
    driverLocation,
    isOnline
  );

  const runList = runs || [];

  const handleAcceptRun = async (assignmentId: string) => {
    if (!driverProfile?.id) {
      Alert.alert('Erreur', 'Profil livreur introuvable.');
      return;
    }

    try {
      setAcceptingId(assignmentId);
      await deliveryService.acceptRun(assignmentId, driverProfile.id);
      Haptics.success();
      router.push(`/run/${assignmentId}` as any);
    } catch (err: any) {
      Alert.alert('Course déjà prise', 'Un autre coursier vient d’accepter cette course.');
      refetch();
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Courses Disponibles</Text>
        <View style={styles.badgeCount}>
          <Text style={styles.badgeText}>{runList.length} active(s)</Text>
        </View>
      </View>

      {!isOnline ? (
        <View style={styles.offlineBox}>
          <AlertCircle size={38} color="#D97706" />
          <Text style={styles.offlineTitle}>Vous êtes Hors Ligne</Text>
          <Text style={styles.offlineSub}>
            Basculez En Ligne pour voir et accepter les livraisons en direct à Daloa.
          </Text>
          <View style={{ marginTop: 14 }}>
            <Button
              title="Passer En Ligne"
              variant="primary"
              size="md"
              onPress={() => toggleOnlineStatus(true)}
            />
          </View>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary.DEFAULT}
              colors={[colors.primary.DEFAULT]}
            />
          }
        >
          {isLoading ? (
            <View style={{ gap: 12 }}>
              <Skeleton width="100%" height={160} borderRadius={radii.xl} />
              <Skeleton width="100%" height={160} borderRadius={radii.xl} />
            </View>
          ) : runList.length === 0 ? (
            <View style={styles.emptyBox}>
              <Zap size={44} color={colors.grey[300]} />
              <Text style={styles.emptyTitle}>Aucune course en attente</Text>
              <Text style={styles.emptySub}>
                Toutes les livraisons à Daloa sont prises en charge. Restez connecté, de nouvelles commandes arrivent !
              </Text>
            </View>
          ) : (
            runList.map((run: AvailableDeliveryRun) => (
              <DeliveryOrderCard
                key={run.assignmentId}
                order={{
                  id: run.assignmentId,
                  status: 'awaiting_pickup',
                  delivery_price: run.deliveryPrice,
                  pickup_location: run.pickupLocation,
                  dropoff_location: run.dropoffLocation,
                  pickup_lat: run.pickupCoordinates?.lat,
                  pickup_lng: run.pickupCoordinates?.lng,
                  dropoff_lat: run.dropoffCoordinates?.lat,
                  dropoff_lng: run.dropoffCoordinates?.lng,
                  seller_phone: run.sellerPhone,
                  buyer_phone: run.buyerPhone,
                  created_at: run.createdAt,
                }}
                onPress={() => handleAcceptRun(run.assignmentId)}
                onAccept={() => handleAcceptRun(run.assignmentId)}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  badgeCount: {
    backgroundColor: '#FFF4E6',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary[700],
  },
  scrollContent: {
    padding: 14,
    backgroundColor: '#F8F9FA',
  },
  offlineBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8F9FA',
  },
  offlineTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginTop: 12,
  },
  offlineSub: {
    fontSize: 13,
    color: colors.grey[600],
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 260,
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
    maxWidth: 250,
    lineHeight: 17,
  },
});
