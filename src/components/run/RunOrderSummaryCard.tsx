import React from 'react';
import { View, Text } from 'react-native';
import { formatFCFA } from '@daloa/utils';
import { runStyles as styles } from './runStyles';

export interface RunOrderSummaryCardProps {
  assignment: any;
  order: any;
  isExpress: boolean;
  deliveryPrice: number;
}

export const RunOrderSummaryCard: React.FC<RunOrderSummaryCardProps> = ({
  assignment,
  order,
  isExpress,
  deliveryPrice,
}) => {
  const orderItems = Array.isArray(order?.order_items) && order.order_items.length > 0 ? order.order_items : null;

  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemCardTitle}>
        {isExpress ? 'Format du colis (sécurisé)' : 'Contenu de la commande'}
      </Text>
      {isExpress ? (
        <>
          <Text style={styles.itemTitle}>
            {assignment.package_description || order.package_description || 'Colis scellé standard'}
          </Text>
          <Text style={styles.itemSub}>
            {`Course Express • Règlement : ${
              assignment.payer_role === 'recipient'
                ? `Encaisser ${formatFCFA(deliveryPrice)} chez le destinataire`
                : "Encaisser au départ auprès de l'expéditeur"
            }`}
          </Text>
        </>
      ) : orderItems ? (
        orderItems.map((it: any, idx: number) => (
          <View key={it.id || idx} style={{ marginTop: idx > 0 ? 6 : 0 }}>
            <Text style={styles.itemTitle}>{it.listings?.title || order.listings?.title || 'Article'}</Text>
            <Text style={styles.itemSub}>
              Quantité : {it.quantity || 1} • {formatFCFA(it.product_amount ?? it.unit_price ?? 0)}
            </Text>
          </View>
        ))
      ) : (
        <>
          <Text style={styles.itemTitle}>{order.listings?.title || 'Article commandé'}</Text>
          <Text style={styles.itemSub}>
            Quantité : {order.quantity || 1} • Prix article : {formatFCFA(order.product_amount ?? order.total_amount ?? 0)}
          </Text>
        </>
      )}
    </View>
  );
};

