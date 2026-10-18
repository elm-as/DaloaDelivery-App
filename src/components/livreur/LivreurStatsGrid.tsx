import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, Navigation, Bike, Car, Truck } from 'lucide-react-native';
import { colors, radii, typography } from '@daloa/ui';

interface LivreurStatsGridProps {
  driverProfile: any;
  hasLocation: boolean;
  locating: boolean;
  onUpdateLocation: () => void;
}

const VEHICLE_ICONS: Record<string, any> = {
  Moto: Bike,
  Vélo: Bike,
  Voiture: Car,
  Triporteur: Truck,
  motorcycle: Bike,
  car: Car,
};

export function LivreurStatsGrid({
  driverProfile,
  hasLocation,
  locating,
  onUpdateLocation,
}: LivreurStatsGridProps) {
  const VehicleIcon = VEHICLE_ICONS[driverProfile?.vehicle_type || ''] || Bike;
  const zonesCount = driverProfile?.coverage_zones?.length || 0;
  const ratingText =
    driverProfile?.total_reviews && driverProfile.total_reviews > 0 && driverProfile?.rating != null
      ? Number(driverProfile.rating).toFixed(1)
      : '-';

  const reviewsCaption =
    driverProfile?.total_reviews && driverProfile.total_reviews > 0
      ? `${driverProfile.total_reviews} avis`
      : 'Nouveau';

  return (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <View style={[styles.statIconWrap, { backgroundColor: colors.status.warningLight }]}>
          <Star size={16} color={colors.status.warning} fill={colors.status.warning} />
        </View>
        <Text style={styles.statValue}>{ratingText}</Text>
        <Text style={styles.statCaption}>{reviewsCaption}</Text>
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
        onPress={onUpdateLocation}
        accessibilityRole="button"
        accessibilityLabel="Mettre à jour ma position GPS"
      >
        <View
          style={[
            styles.statIconWrap,
            { backgroundColor: hasLocation ? colors.status.successLight : colors.bg.subtle },
          ]}
        >
          <Navigation
            size={16}
            color={hasLocation ? colors.status.successDark : colors.text.subtle}
          />
        </View>
        <Text style={styles.statValueSm}>GPS</Text>
        <Text
          style={[
            styles.statCaption,
            hasLocation && !locating ? { color: colors.status.successDark } : null,
          ]}
        >
          {locating ? 'En cours...' : hasLocation ? 'À jour' : 'Activer'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 15,
    fontFamily: typography.families.black,
    color: colors.text.DEFAULT,
    fontVariant: ['tabular-nums'],
  },
  statValueSm: {
    fontSize: 12.5,
    fontFamily: typography.families.extrabold,
    color: colors.text.DEFAULT,
  },
  statCaption: {
    fontSize: 10,
    fontFamily: typography.families.medium,
    color: colors.text.muted,
    marginTop: 2,
  },
});
