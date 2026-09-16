import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import {
  Bike, Car, Truck, Zap, Wallet, Shield, ChevronRight, Moon, AlertTriangle, ShieldCheck,
  Star, Navigation, Package, MapPin, RefreshCw,
} from 'lucide-react-native';
import { colors, radii, Button, DeliveryOrderCard, Skeleton } from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import { useDriverDailyStats, useAvailableRuns, deliveryService } from '@daloa/api';
import { AvailableDeliveryRun } from '@daloa/types';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { DeliveryTopBar } from '../../src/components/DeliveryTopBar';
import { DriverHeroHeader } from '../../src/components/DriverHeroHeader';
import { DeliveryMap } from '../../src/components/map/DeliveryMap';
import { styles } from '../../src/components/livreur/livreurStyles';
import { isCurfewActive } from '../../src/utils/security';

/** Même correspondance véhicule → icône que le tableau de bord web. */
const VEHICLE_ICONS: Record<string, any> = {
  Moto: Bike, Vélo: Bike, Voiture: Car, Triporteur: Truck, motorcycle: Bike, car: Car,
};

export default function LivreurTabScreen() {
  const router = useRouter();
  const {
    driverProfile, isOnline, toggleOnlineStatus, isAuthenticated, isAdmin, driverLocation,
    refreshDriverProfile,
  } = useDriverAuth();

  const [activeTab, setActiveTab] = useState<'liste' | 'carte'>('liste');
  const [locating, setLocating] = useState(false);

  const { data: stats, refetch: refetchStats, isRefetching } = useDriverDailyStats(driverProfile?.id);
  const { data: availableRuns, isLoading: runsLoading, refetch: refetchRuns } = useAvailableRuns(
    driverLocation,
    isOnline
  );

  const runList: AvailableDeliveryRun[] = availableRuns || [];

  /* Le web met en avant les courses qui touchent une zone couverte par le livreur
     (tri décroissant « dans ma zone » d'abord) — même règle ici. */
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
    return [{
      id: driverProfile?.id || 'me',
      name: driverProfile?.name || 'Ma position',
      vehicle: driverProfile?.vehicle_type || 'Moto',
      rating: Number(driverProfile?.rating) || 5,
      lat: coords.lat,
      lng: coords.lng,
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
    await Promise.all([refetchStats(), refetchRuns()]);
  };

  const handleToggleOnline = async () => {
    Haptics.selection();
    await toggleOnlineStatus(!isOnline);
  };

  /* Équivalent du bouton GPS du web : on redemande une position et on la publie
     pour que la carte et les vendeurs voient le livreur au bon endroit. */
  const handleUpdateLocation = async () => {
    if (!driverProfile?.id || locating) return;
    Haptics.lightImpact();
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      await deliveryService.updateDriverLocation(driverProfile.id, {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      await refreshDriverProfile();
    } catch (err) {
      console.warn('Position indisponible:', err);
    } finally {
      setLocating(false);
    }
  };

  const handleAcceptRun = async (assignmentId: string) => {
    if (!driverProfile?.id || isCurfewActive()) return;
    try {
      await deliveryService.acceptRun(assignmentId, driverProfile.id);
      Haptics.success();
      router.push(`/run/${assignmentId}` as any);
    } catch (err) {
      refetchRuns();
    }
  };

  // Un administrateur sans fiche livreur n'a rien à faire sur cette console.
  // Placé après les hooks : un retour anticipé plus haut changerait le nombre de
  // hooks rendus dès que la session se résout, et ferait planter React.
  if (isAuthenticated && isAdmin && !driverProfile) {
    return <Redirect href={'/admin' as any} />;
  }

  // ── Cas 1 : Visiteur non connecté (Page de recrutement / Espace Livreur) ──
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <DeliveryTopBar title="Espace Livreur" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.unauthContent}>
          <LinearGradient
            colors={[colors.primary[400], colors.primary.DEFAULT, colors.primary[700]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.unauthHero}
          >
            <View style={styles.unauthIconCircle}>
              <Bike size={32} color={colors.primary[700]} />
            </View>
            <Text style={styles.unauthHeroTitle}>Rejoignez la flotte{'\n'}DaloaDelivery</Text>
            <Text style={styles.unauthHeroSub}>
              Devenez coursier partenaire à Daloa et générez des revenus réguliers avec des paiements directs.
            </Text>
          </LinearGradient>
          <View style={styles.perksCard}>
            <Text style={styles.perksHeader}>Pourquoi livrer avec nous ?</Text>

            <View style={styles.perkRow}>
              <View style={[styles.perkIcon, { backgroundColor: colors.status.successLight }]}>
                <Wallet size={16} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.perkTitle}>Paiements Wave & MTN</Text>
                <Text style={styles.perkDesc}>Encaissez vos gains chaque jour directement sur votre compte mobile money.</Text>
              </View>
            </View>

            <View style={styles.perkRow}>
              <View style={[styles.perkIcon, { backgroundColor: colors.primary[50] }]}>
                <Zap size={16} color={colors.primary[700]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.perkTitle}>Courses en direct</Text>
                <Text style={styles.perkDesc}>Recevez les demandes de livraison en temps réel sur toute la ville de Daloa.</Text>
              </View>
            </View>

            <View style={styles.perkRow}>
              <View style={[styles.perkIcon, { backgroundColor: colors.status.infoLight }]}>
                <Shield size={16} color={colors.categories.electronics.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.perkTitle}>Profil vérifié & sécurisé</Text>
                <Text style={styles.perkDesc}>Bénéficiez de la confiance des commerçants et clients de DaloaMarket.</Text>
              </View>
            </View>

            <View style={styles.actionButtonsWrap}>
              <Button
                title="Connexion Livreur"
                variant="primary"
                size="lg"
                onPress={() => router.push('/auth/login' as any)}
                fullWidth
              />
              <View style={{ height: 10 }} />
              <Button
                title="Devenir Livreur Partenaire"
                variant="outline"
                size="lg"
                onPress={() => router.push('/auth/register' as any)}
                fullWidth
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Cas 2 : Livreur connecté — même tableau de bord que /dashboard sur le web ──
  const VehicleIcon = VEHICLE_ICONS[driverProfile?.vehicle_type || ''] || Bike;
  const zonesCount = driverProfile?.coverage_zones?.length || 0;
  const hasLocation = Boolean(driverLocation || driverProfile?.current_location);
  const curfew = isCurfewActive();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DeliveryTopBar title="Tableau de bord" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={[colors.primary.DEFAULT]}
            tintColor={colors.primary.DEFAULT}
          />
        }
      >
        <DriverHeroHeader
          driverProfile={driverProfile}
          isOnline={isOnline}
          onToggleOnline={handleToggleOnline}
          onRefresh={handleRefresh}
          isRefreshing={isRefetching}
        />

        <View style={styles.dashSection}>
          {/* Accès direct Admin si l'utilisateur a le rôle admin */}
          {isAdmin && (
            <TouchableOpacity
              style={styles.adminBanner}
              onPress={() => {
                Haptics.selection();
                router.push('/admin' as any);
              }}
            >
              <ShieldCheck size={22} color="#1E40AF" />
              <View style={{ flex: 1 }}>
                <Text style={styles.adminBannerTitle}>Panneau d'Administration</Text>
                <Text style={styles.adminBannerSub}>Validation des livreurs & litiges</Text>
              </View>
              <ChevronRight size={18} color="#1E40AF" />
            </TouchableOpacity>
          )}

          {/* Alerte Mode de Retrait Wave / MTN manquant */}
          {driverProfile && (!driverProfile.payout_network || !driverProfile.payout_number) && (
            <View style={styles.payoutWarningCard}>
              <AlertTriangle size={22} color={colors.status.warningDark} />
              <View style={{ flex: 1 }}>
                <Text style={styles.payoutWarningTitle}>Mode de retrait non configuré</Text>
                <Text style={styles.payoutWarningSub}>
                  Renseignez votre compte Wave ou MTN pour recevoir automatiquement vos gains de livraisons.
                </Text>
                <TouchableOpacity
                  style={styles.payoutWarningBtn}
                  onPress={() => router.push('/payout-setup' as any)}
                >
                  <Text style={styles.payoutWarningBtnText}>Configurer mon retrait Wave / MTN</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Alerte si le compte est connecté mais sans fiche livreur */}
          {!driverProfile && !isAdmin && (
            <View style={styles.missingProfileCard}>
              <Text style={styles.missingProfileTitle}>Finalisez votre inscription livreur</Text>
              <Text style={styles.missingProfileSub}>
                Vous êtes connecté à DaloaDelivery. Complétez vos informations de véhicule et Mobile Money pour commencer à livrer.
              </Text>
              <Button
                title="Compléter ma fiche livreur"
                variant="primary"
                size="sm"
                onPress={() => router.push('/auth/register' as any)}
                style={styles.missingProfileBtn}
              />
            </View>
          )}

          {/* Gains du jour, net de commission */}
          <View style={styles.earningsCard}>
            <View>
              <Text style={styles.earningsLabel}>Gains du jour (net de commission)</Text>
              <View style={styles.earningsValueRow}>
                <Text style={styles.earningsValue}>
                  {(stats?.earningsToday || 0).toLocaleString('fr-FR')}
                </Text>
                <Text style={styles.earningsCurrency}>FCFA</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.detailsBtn}
              activeOpacity={0.8}
              onPress={() => {
                Haptics.lightImpact();
                router.push('/(tabs)/earnings');
              }}
              accessibilityLabel="Détails des gains"
            >
              <Text style={styles.detailsBtnText}>Détails</Text>
              <ChevronRight size={15} color={colors.primary[700]} />
            </TouchableOpacity>
          </View>

          {/* Note · Véhicule · GPS */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{(Number(driverProfile?.rating) || 5).toFixed(1)}</Text>
              <Text style={styles.statCaption}>{driverProfile?.total_reviews || 0} avis</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: colors.primary[50] }]}>
                <VehicleIcon size={16} color={colors.primary[700]} />
              </View>
              <Text style={styles.statValueSm} numberOfLines={1}>
                {driverProfile?.vehicle_type || 'Moto'}
              </Text>
              <Text style={styles.statCaption}>{zonesCount} zones</Text>
            </View>

            <TouchableOpacity
              style={styles.statCard}
              activeOpacity={0.85}
              onPress={handleUpdateLocation}
              accessibilityLabel="Mettre à jour ma position GPS"
            >
              <View
                style={[
                  styles.statIconWrap,
                  { backgroundColor: hasLocation ? colors.status.successLight : colors.grey[50] },
                ]}
              >
                <Navigation size={16} color={hasLocation ? '#059669' : colors.grey[400]} />
              </View>
              <Text style={styles.statValueSm}>GPS</Text>
              <Text
                style={[
                  styles.statCaption,
                  hasLocation && !locating ? { color: '#059669' } : null,
                ]}
              >
                {locating ? 'En cours...' : hasLocation ? 'À jour' : 'Activer'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Courses disponibles */}
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
              <Moon size={22} color="#FBBF24" />
              <View style={{ flex: 1 }}>
                <Text style={styles.curfewTitle}>Couvre-feu de sécurité (22h30 — 05h30)</Text>
                <Text style={styles.curfewSub}>
                  Les attributions de courses sont automatiquement suspendues durant la nuit pour protéger les livreurs et les marchandises à Daloa.
                </Text>
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
