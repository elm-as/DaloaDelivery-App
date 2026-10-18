import { Linking, Platform } from 'react-native';
import { showAlert } from '@daloa/ui';

/**
 * Lance l'appel téléphonique vers un contact.
 */
export function makePhoneCall(phone?: string | null): void {
  if (!phone) {
    showAlert('Numéro indisponible', 'Aucun contact téléphonique renseigné.');
    return;
  }
  Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
}

/**
 * Ouvre l'application de guidage GPS (Google Maps / Apple Maps).
 */
export function openExternalGps(address: string, lat?: number | null, lng?: number | null): void {
  if (lat && lng) {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const label = encodeURIComponent(address);
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    if (url) {
      Linking.openURL(url);
      return;
    }
  }

  const encoded = encodeURIComponent(`${address}, Daloa, Côte d'Ivoire`);
  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
}
