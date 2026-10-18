import { AvailableDeliveryRun } from '@daloa/types';

export const DEMO_ASSIGNMENT_ID = 'demo-run';
export const DEMO_ORDER_ID = 'demo-order-1';

/**
 * Détermine si un identifiant de course correspond au mode simulation test.
 */
export function isDemoRun(id?: string | null): boolean {
  if (!id) return false;
  return id === DEMO_ASSIGNMENT_ID || id.startsWith('demo-');
}

/**
 * Génère une course simulée disponible pour les évaluateurs et testeurs.
 */
export function createDemoAvailableRun(): AvailableDeliveryRun {
  return {
    assignmentId: DEMO_ASSIGNMENT_ID,
    orderId: DEMO_ORDER_ID,
    pickupLocation: 'Marché Central, Daloa (Boutique Ivoire Mode)',
    dropoffLocation: 'Quartier Tazibouo, Daloa (Villa 42)',
    pickupDistrict: 'Marché Central',
    dropoffDistrict: 'Tazibouo',
    pickupCoordinates: { lat: 6.8770, lng: -6.4450 },
    dropoffCoordinates: { lat: 6.8833, lng: -6.4500 },
    distanceKm: 2.4,
    deliveryPrice: 1500,
    driverFee: 150,
    driverNetGain: 1350,
    isPrivate: false,
    sellerName: 'Boutique Ivoire Mode (Démo)',
    sellerPhone: '+225 07 00 00 00 00',
    buyerName: 'Kouamé Jean (Client Test)',
    buyerPhone: '+225 05 00 00 00 00',
    productTitle: 'Paire de Chaussures Sport Daloa',
    productPhoto: null,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Génère les détails complets d'une course simulée pour l'écran d'exécution.
 */
export function createDemoRunDetails(status: string = 'accepted') {
  return {
    assignment: {
      id: DEMO_ASSIGNMENT_ID,
      order_id: DEMO_ORDER_ID,
      status,
      delivery_price: 1500,
      pickup_location: 'Marché Central, Daloa (Boutique Ivoire Mode)',
      dropoff_location: 'Quartier Tazibouo, Daloa (Villa 42)',
      created_at: new Date().toISOString(),
    },
    order: {
      id: DEMO_ORDER_ID,
      status: 'paid',
      delivery_fee: 1500,
      total_amount: 15000,
      product_amount: 13500,
      quantity: 1,
      payment_method: 'online',
      delivery_lat: 6.8833,
      delivery_lng: -6.4500,
      seller: {
        id: 'seller-demo-id',
        full_name: 'Boutique Ivoire Mode (Démo)',
        shop_name: 'Ivoire Mode Daloa',
        phone: '+225 07 00 00 00 00',
        shop_latitude: 6.8770,
        shop_longitude: -6.4450,
      },
      buyer: {
        id: 'buyer-demo-id',
        full_name: 'Kouamé Jean (Client Test)',
        phone: '+225 05 00 00 00 00',
      },
      listings: {
        id: 'listing-demo-id',
        title: 'Paire de Chaussures Sport Daloa',
        price: 13500,
      },
    },
  };
}

/**
 * Calcule l'étape suivante lors de la validation d'un OTP en mode démo.
 */
export function getNextDemoStatus(currentStatus: string, otpType: 'pickup' | 'delivery'): string {
  if (otpType === 'pickup') {
    return 'in_transit';
  }
  return 'delivered';
}
