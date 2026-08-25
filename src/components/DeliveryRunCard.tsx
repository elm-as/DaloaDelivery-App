import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { AvailableDeliveryRun } from '@daloa/types';
import { colors, radii, spacing, typography, Card, CurrencyText, Button, Badge } from '@daloa/ui';
import { MapPin, Navigation, ArrowRight, ShieldCheck, Clock } from 'lucide-react-native';
import { formatDistance, Haptics } from '@daloa/utils';

export interface DeliveryRunCardProps {
  run: AvailableDeliveryRun;
  onAccept?: () => void;
  onPressDetails?: () => void;
  isAccepting?: boolean;
}

export const DeliveryRunCard: React.FC<DeliveryRunCardProps> = ({
  run,
  onAccept,
  onPressDetails,
  isAccepting = false,
}) => {
  return (
    <Card
      onPress={onPressDetails}
      variant="glowDelivery"
      style={styles.card}
    >
      {/* Header : Gain Livreur & Distance */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.gainLabel}>Gain net livreur</Text>
          <CurrencyText
            amount={run.driverNetGain}
            size="xl"
            weight="extrabold"
            color={colors.delivery.primary}
          />
        </View>

        <View style={styles.distanceBadge}>
          <Navigation size={13} color="#FFFFFF" />
          <Text style={styles.distanceText}>{formatDistance(run.distanceKm)}</Text>
        </View>
      </View>

      {/* Trajet : Départ (Vendeur) -> Arrivée (Acheteur) */}
      <View style={styles.routeContainer}>
        {/* Départ */}
        <View style={styles.routeStep}>
          <View style={[styles.dot, styles.dotPickup]} />
          <View style={styles.stepInfo}>
            <Text style={styles.stepLabel}>Ramassage (Vendeur)</Text>
            <Text style={styles.stepDistrict}>{run.pickupDistrict}</Text>
            <Text style={styles.stepLocation} numberOfLines={1}>
              {run.pickupLocation}
            </Text>
          </View>
        </View>

        {/* Ligne connectrice */}
        <View style={styles.routeLine} />

        {/* Arrivée */}
        <View style={styles.routeStep}>
          <View style={[styles.dot, styles.dotDropoff]} />
          <View style={styles.stepInfo}>
            <Text style={styles.stepLabel}>Livraison (Acheteur)</Text>
            <Text style={styles.stepDistrict}>{run.dropoffDistrict}</Text>
            <Text style={styles.stepLocation} numberOfLines={1}>
              {run.dropoffLocation}
            </Text>
          </View>
        </View>
      </View>

      {/* Détails Article & Séquestre */}
      {run.productTitle && (
        <View style={styles.productRow}>
          <Text style={styles.productText} numberOfLines={1}>
            📦 Colis : {run.productTitle}
          </Text>
        </View>
      )}

      {/* Bouton d'Acceptation Immédiate */}
      {onAccept && (
        <Button
          title="Accepter cette course"
          variant="delivery"
          size="md"
          loading={isAccepting}
          onPress={() => {
            Haptics.success();
            onAccept();
          }}
          style={styles.acceptBtn}
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing[4],
    marginBottom: spacing[3],
    gap: spacing[3],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
    paddingBottom: spacing[3],
  },
  gainLabel: {
    color: colors.dark.textMuted,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginBottom: 2,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.dark.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radii.full,
    gap: 4,
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  routeContainer: {
    gap: 4,
    position: 'relative',
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  dotPickup: {
    backgroundColor: colors.market.primary,
  },
  dotDropoff: {
    backgroundColor: colors.delivery.primary,
  },
  routeLine: {
    width: 2,
    height: 18,
    backgroundColor: colors.dark.borderLight,
    marginLeft: 5,
    marginVertical: -2,
  },
  stepInfo: {
    flex: 1,
    gap: 1,
  },
  stepLabel: {
    color: colors.dark.textDim,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepDistrict: {
    color: colors.dark.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  stepLocation: {
    color: colors.dark.textMuted,
    fontSize: typography.sizes.xs,
  },
  productRow: {
    backgroundColor: colors.dark.surfaceRaised,
    borderRadius: radii.lg,
    padding: spacing[2],
  },
  productText: {
    color: colors.dark.textMuted,
    fontSize: typography.sizes.xs,
  },
  acceptBtn: {
    marginTop: spacing[1],
  },
});
