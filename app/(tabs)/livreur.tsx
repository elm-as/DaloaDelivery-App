import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect } from 'expo-router';
import * as Location from 'expo-location';
import { Moon, Package, MapPin, RefreshCw } from 'lucide-react-native';
import { colors, radii, DeliveryOrderCard, Skeleton, showAlert } from '@daloa/ui';
import { DALOA_CENTER } from '@daloa/config';
import { Haptics, isLocationInDaloa, withTimeout, GPS_TIMEOUT_MS } from '@daloa/utils';
import { useDriverDailyStats, useAvailableRuns, deliveryService } from '@daloa/api';
import { AvailableDeliveryRun } from '@daloa/types';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { DeliveryTopBar } from '../../src/components/DeliveryTopBar';
import { DriverHeroHeader } from '../../src/components/DriverHeroHeader';
import { DeliveryMap } from '../../src/components/map/DeliveryMap';
import { styles } from '../../src/components/livreur/livreurStyles';
import { isCurfewActive } from '../../src/utils/security';
import { DemoRunCard } from '../../src/components/DemoRunCard';
import { LivreurDailySummary } from '../../src/components/livreur/LivreurDailySummary';
import { LivreurStatsGrid } from '../../src/components/livreur/LivreurStatsGrid';

export default function LivreurTabScreen() {
  const router = useRouter();
  const {
    driverProfile, isOnline, toggleOnlineStatus, isAuthenticated, driverLocation,
    refreshDriverProfile, isLoading,
  } = useDriverAuth();

  const [activeTab, setActiveTab] = useState<'liste' | 'carte'>('liste');
  const [locating, setLocating] = useState(false);

  const { data: stats, refetch: refetchStats, isRefetching } = useDriverDailyStats(driverProfile?.id);
  const { data: availableRuns, isLoading: runsLoading, refetch: refetchRuns } = useAvailableRuns(
    driverLocation,
    isOnline
  );

  const runList: AvailableDeliveryRun[] = availableRuns || [];

  const sortedRuns = useMemo(() => {
    const zones = driverProfile?.coverage_zones || [];
    if (zones.length === 0) return runList;

    const inZone = (run: AvailableDeliveryRun) => {
      const pickup = (run.pickupLocation || '').toLowerCase();
      const dropoff = (run.dropoffLocation || '').toLowerCase();
      return zones.some((z: string) => {
        const zone = z.toLowerCase();
        return pickup.includes(zone) || dropoff.includes(zone);
      });
    };

    return [...runList].sort((a, b) => Number(inZone(b)) - Number(inZone(a)));
  }, [runList, driverProfile?.coverage_zones]);

  const mapDrivers = useMemo(() => {
    const coords: any = driverLocation || driverProfile?.current_location;
    if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') return [];
    const validLat = isLocationInDaloa(coords.lat, coords.lng) ? coords.lat : DALOA_CENTER.lat;
    const validLng = isLocationInDaloa(coords.lat, coords.lng) ? coords.lng : DALOA_CENTER.lng;
    return [{
      id: driverProfile?.id || 'me',
      name: driverProfile?.name || 'Ma position',
      vehicle: driverProfile?.vehicle_type || 'Moto',
      rating: Number(driverProfile?.rating) || 5,
      lat: validLat,
      lng: validLng,
    }];
  }, [driverLocation, driverProfile]);

  const mapOrders = useMemo(
    () =>
      sortedRuns.flatMap((run) => {
        const coords = run.pickupCoordinates;
        if (!coords) return [];
        return [{
          id: run.assignmentId,
          netPrice: run.driverNetGain,
          pickup: run.pickupLocation,
          dropoff: run.dropoffLocation,
          lat: coords.lat,
          lng: coords.lng,
        }];
      }),
    [sortedRuns]
  );

  const handleRefresh = async () => {
    await Promise.all([refetchStats(), refetchRuns(), refreshDriverProfile()]);
  };

  const handleUpdateLocation = async () => {
    try {
      setLocating(true);
      Haptics.lightImpact();
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Localisation refusée', 'Activez le GPS dans les réglages pour recevoir les courses à proximité.');
        return;
      }
      const pos = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        GPS_TIMEOUT_MS
      );
      if (!pos) {
        showAlert('Délai GPS dépassé', 'Impossible d’obtenir le signal GPS. Vérifiez que la localisation est active.');
        return;
      }
      if (driverProfile?.id) {
        await deliveryService.updateDriverLocation(driverProfile.id, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        await refreshDriverProfile();
        Haptics.success();
        showAlert('Position actualisée', 'Votre position a été mise à jour.');
      }
    } catch (err: any) {
      showAlert('Erreur GPS', err?.message || 'Impossible de récupérer votre position.');
    } finally {
      setLocating(false);
    }
  };

  const handleAcceptRun = async (assignmentId: string) => {
    if (isCurfewActive()) {
      showAlert('Sécurité Nocturne', 'Les livraisons sont suspendues entre 22h30 et 05h30 pour votre sécurité.');
      return;
    }
    if (!driverProfile?.id) {
      showAlert('Erreur', 'Profil livreur introuvable.');
      return;
    }

    try {
      await deliveryService.acceptRun(assignmentId, driverProfile.id);
      Haptics.success();
      await refetchRuns();
      router.push(`/run/${assignmentId}` as any);
    } catch (err: any) {
      showAlert('Acceptation impossible', err?.message || 'Un autre coursier vient d’accepter cette course.');
      refetchRuns();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const curfew = isCurfewActive();
  const hasLocation = Boolean(driverLocation || driverProfile?.current_location);

  return (
    <SafeAreaView style={styles.container}>
      <DeliveryTopBar />
      <DriverHeroHeader
        driverProfile={driverProfile}
        isOnline={isOnline}
        onToggleOnline={() => toggleOnlineStatus(!isOnline)}
        onRefresh={handleRefresh}
        isRefreshing={isRefetching}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary.DEFAULT}
            colors={[colors.primary.DEFAULT]}
          />
        }
      >
        <View style={styles.contentPad}>
          <LivreurDailySummary earningsToday={stats?.earningsToday || 0} />

          <LivreurStatsGrid
            driverProfile={driverProfile}
            hasLocation={hasLocation}
            locating={locating}
            onUpdateLocation={handleUpdateLocation}
          />

          <View style={styles.runsHeaderRow}>
            <Text style={styles.runsHeaderTitle}>Courses disponibles</Text>
            {!curfew && sortedRuns.length > 0 && (
              <View style={styles.runsCountPill}>
                <Text style={styles.runsCountText}>{sortedRuns.length}</Text>
              </View>
            )}
          </View>

          {curfew ? (
            <View style={styles.curfewCard}>
              <Moon size={22} color={colors.status.warning} />
              <View style={{ flex: 1 }}>
                <Text style={styles.curfewTitle}>Couvre-feu de sécurité (22h30 à 05h30)</Text>
                <Text style={styles.curfewSub}>
                  Les attributions de courses sont automatiquement suspendues durant la nuit pour protéger les livreurs et les marchandises à Daloa.
                </Text>
                <View style={{ marginTop: 12 }}>
                  <DemoRunCard onStartDemo={() => router.push('/run/demo-run')} />
                </View>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.segmented}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    Haptics.selection();
                    setActiveTab('liste');
                  }}
                  style={[styles.segmentedItem, activeTab === 'liste' && styles.segmentedItemActive]}
                >
                  <Package size={15} color={activeTab === 'liste' ? colors.primary[700] : colors.text.muted} />
                  <Text style={[styles.segmentedText, activeTab === 'liste' && styles.segmentedTextActive]}>
                    Liste ({sortedRuns.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    Haptics.selection();
                    setActiveTab('carte');
                  }}
                  style={[styles.segmentedItem, activeTab === 'carte' && styles.segmentedItemActive]}
                >
                  <MapPin size={15} color={activeTab === 'carte' ? colors.primary[700] : colors.text.muted} />
                  <Text style={[styles.segmentedText, activeTab === 'carte' && styles.segmentedTextActive]}>
                    Carte en direct
                  </Text>
                </TouchableOpacity>
              </View>

              {activeTab === 'carte' ? (
                <DeliveryMap drivers={mapDrivers} orders={mapOrders} height={400} />
              ) : runsLoading ? (
                <View style={{ gap: 12 }}>
                  <Skeleton width="100%" height={160} borderRadius={radii['2xl']} />
                  <Skeleton width="100%" height={160} borderRadius={radii['2xl']} />
                </View>
              ) : sortedRuns.length === 0 ? (
                <View>
                  <DemoRunCard onStartDemo={() => router.push('/run/demo-run')} />
                  <View style={styles.emptyRunsCard}>
                    <View style={styles.emptyRunsIcon}>
                      <Package size={30} color={colors.grey[300]} />
                    </View>
                    <Text style={styles.emptyRunsTitle}>Aucune course pour le moment</Text>
                    <Text style={styles.emptyRunsSub}>
                      Restez en ligne, les nouvelles livraisons dans vos zones apparaîtront ici automatiquement avec une alerte sonore.
                    </Text>
                    <TouchableOpacity style={styles.emptyRunsBtn} activeOpacity={0.8} onPress={handleRefresh}>
                      <RefreshCw size={13} color={colors.text.body} />
                      <Text style={styles.emptyRunsBtnText}>Actualiser</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                sortedRuns.map((run) => (
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
                      is_express: run.isExpress,
                      package_description: run.packageDescription,
                      package_type: run.packageType,
                      sender_name: run.senderName,
                      recipient_name: run.recipientName,
                      payer_role: run.payerRole,
                      is_grouped: run.isGrouped,
                      group_total_stops: run.groupTotalStops,
                      group_completed_stops: run.groupCompletedStops,
                    }}
                    onPress={() => handleAcceptRun(run.assignmentId)}
                    onAccept={() => handleAcceptRun(run.assignmentId)}
                  />
                ))
              )}
            </>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
