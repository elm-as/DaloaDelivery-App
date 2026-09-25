import React, { useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, radii } from '@daloa/ui';
import { buildDeliveryMapHtml, MapDriverMarker, MapOrderMarker } from './deliveryMapHtml';

export interface DeliveryMapProps {
  drivers: MapDriverMarker[];
  orders: MapOrderMarker[];
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Variante navigateur : `react-native-webview` n'a pas d'implémentation web, donc
 * on pose directement l'iframe que react-native-web sait rendre. Le document
 * chargé est exactement celui de la version mobile.
 */
export const DeliveryMap: React.FC<DeliveryMapProps> = ({ drivers, orders, height = 400, style }) => {
  // Même règle que la version mobile : on ne régénère la carte (et on ne perd
  // le zoom) que si les positions ont réellement changé.
  const markersKey = useMemo(
    () =>
      JSON.stringify([
        drivers.map((d) => [d.id, d.lat?.toFixed(3), d.lng?.toFixed(3)]),
        orders.map((o) => [o.id, o.lat?.toFixed(4), o.lng?.toFixed(4)]),
      ]),
    [drivers, orders]
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const html = useMemo(() => buildDeliveryMapHtml(drivers, orders), [markersKey]);

  return (
    <View style={[styles.wrap, { height }, style]}>
      {React.createElement('iframe', {
        srcDoc: html,
        title: 'Carte des courses en direct',
        style: { width: '100%', height: '100%', border: 'none', display: 'block' },
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: radii['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.bg.subtle,
  },
});

export default DeliveryMap;
