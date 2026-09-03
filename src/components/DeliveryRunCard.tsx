import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AvailableDeliveryRun } from '@daloa/types';
import { colors, radii, spacing, typography, Card, Button } from '@daloa/ui';
import { Navigation } from 'lucide-react-native';
import { formatDistance, formatFCFA, Haptics } from '@daloa/utils';

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
      style={styles.card}
    >
      {/* Header : Gain Livreur & Distance */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.gainLabel}>Gain net livreur</Text>
          <Text style={styles.gainAmount}>{formatFCFA(run.driverNetGain)}</Text>
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
          variant="primary"
          size="md"
          loading={isAccepting}
          onPress={() => {
            Haptics.success();
            onAccept();
          }}
          fullWidth
          style={styles.acceptBtn}
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: spacing[4],
    marginBottom: spacing[3],
    gap: spacing[3],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: spacing[3],
  },
  gainLabel: {
    color: colors.grey[500],
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  gainAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary[600],
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.DEFAULT,
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
    backgroundColor: colors.primary.DEFAULT,
  },
  dotDropoff: {
    backgroundColor: colors.secondary.DEFAULT,
  },
  routeLine: {
    width: 2,
    height: 18,
    backgroundColor: '#E5E7EB',
    marginLeft: 5,
    marginVertical: -2,
  },
  stepInfo: {
    flex: 1,
    gap: 1,
  },
  stepLabel: {
    color: colors.grey[400],
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  stepDistrict: {
    color: '#111827',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  stepLocation: {
    color: colors.grey[600],
    fontSize: typography.sizes.xs,
  },
  productRow: {
    backgroundColor: '#F9FAFB',
    borderRadius: radii.md,
    padding: spacing[2],
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productText: {
    color: colors.grey[700],
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  acceptBtn: {
    marginTop: spacing[1],
  },
});
