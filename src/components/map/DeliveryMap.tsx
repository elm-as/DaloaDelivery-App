import React, { useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, radii } from '@daloa/ui';
import { buildDeliveryMapHtml, MapDriverMarker, MapOrderMarker } from './deliveryMapHtml';

export interface DeliveryMapProps {
  drivers: MapDriverMarker[];
  orders: MapOrderMarker[];
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/** Carte des courses — version mobile (WebView). Voir `DeliveryMap.web.tsx`
 *  pour la variante navigateur : même HTML, autre conteneur. */
export const DeliveryMap: React.FC<DeliveryMapProps> = ({ drivers, orders, height = 400, style }) => {
  const html = useMemo(() => buildDeliveryMapHtml(drivers, orders), [drivers, orders]);

  return (
    <View style={[styles.wrap, { height }, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.web}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
      />
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
  web: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default DeliveryMap;
