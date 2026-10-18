import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, MapPin, Package } from 'lucide-react-native';
import { colors, radii, typography } from '@daloa/ui';
import { formatDate, formatFCFA } from '@daloa/utils';

interface HistoryRunCardProps {
  run: any;
  isInProgressTab: boolean;
  onPress: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending_seller_confirmation: 'Attente vendeur',
  awaiting_pickup: 'À ramasser',
  accepted: 'Acceptée',
  picked_up: 'En transit',
  in_transit: 'En cours de livraison',
  delivered: 'Livrée',
  auto_released: 'Clôturée',
  disputed: 'En litige',
  cancelled: 'Annulée',
};

export function HistoryRunCard({ run, isInProgressTab, onPress }: HistoryRunCardProps) {
  const isDelivered = run.status === 'delivered' || run.status === 'auto_released';
  const isCancelled = run.status === 'cancelled' || run.status === 'disputed';
  const gain = Math.round((Number(run.delivery_price) || 0) * 0.9);
  const statusLabel = STATUS_LABELS[run.status] || (isDelivered ? 'Livrée' : 'En cours');

  const badgeBg = isInProgressTab
    ? colors.primary[50]
    : isDelivered
      ? colors.status.successLight
      : colors.status.errorLight;

  const badgeTextColor = isInProgressTab
    ? colors.primary[700]
    : isDelivered
      ? colors.status.successDark
      : colors.status.errorDark;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, isInProgressTab && styles.cardActive]}
      accessibilityRole="button"
      accessibilityLabel={`Course ${run.id.slice(0, 8)}`}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderNumber}>Course #{run.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={styles.dateText}>
            {formatDate(run.delivered_at || run.created_at, true)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.statusText, { color: badgeTextColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.routeRow}>
        <View style={styles.routeCol}>
          <MapPin size={13} color={colors.primary.DEFAULT} />
          <Text style={styles.routeLabel}>Départ :</Text>
          <Text style={styles.routeVal} numberOfLines={1}>
            {run.pickup_location || 'Boutique vendeur'}
          </Text>
        </View>
        <View style={styles.routeCol}>
          <MapPin size={13} color={colors.status.success} />
          <Text style={styles.routeLabel}>Arrivée :</Text>
          <Text style={styles.routeVal} numberOfLines={1}>
            {run.dropoff_location || 'Client destinataire'}
          </Text>
        </View>
      </View>

      {Boolean(run.orders?.listings?.title) && (
        <View style={styles.productRow}>
          <Package size={13} color={colors.text.muted} />
          <Text style={styles.productTitle} numberOfLines={1}>
            {run.orders.listings.title}
          </Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.gainLabel}>Gain net livreur</Text>
        <View style={styles.gainRight}>
          <Text style={styles.gainVal}>{formatFCFA(gain)}</Text>
          <ChevronRight size={15} color={colors.text.subtle} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: 14,
    marginBottom: 10,
  },
  cardActive: {
    borderColor: colors.primary[300],
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  orderNumber: {
    fontSize: 13,
    fontFamily: typography.families.extrabold,
    color: colors.text.DEFAULT,
    fontVariant: ['tabular-nums'],
  },
  dateText: {
    fontSize: 11,
    fontFamily: typography.families.medium,
    color: colors.text.subtle,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  statusText: {
    fontSize: 10.5,
    fontFamily: typography.families.extrabold,
  },
  routeRow: {
    marginVertical: 8,
    gap: 4,
  },
  routeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeLabel: {
    fontSize: 11.5,
    fontFamily: typography.families.bold,
    color: colors.text.muted,
    width: 52,
  },
  routeVal: {
    fontSize: 12,
    fontFamily: typography.families.semibold,
    color: colors.text.body,
    flex: 1,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.bg.subtle,
    borderRadius: radii.md,
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 11.5,
    fontFamily: typography.families.medium,
    color: colors.text.body,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  gainLabel: {
    fontSize: 11.5,
    fontFamily: typography.families.semibold,
    color: colors.text.muted,
  },
  gainRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gainVal: {
    fontSize: 14,
    fontFamily: typography.families.black,
    color: colors.primary[700],
    fontVariant: ['tabular-nums'],
  },
});
