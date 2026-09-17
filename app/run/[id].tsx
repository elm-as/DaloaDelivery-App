import { colors, showAlert } from '@daloa/ui';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, AlertTriangle } from 'lucide-react-native';
import { formatFCFA, Haptics } from '@daloa/utils';
import { deliveryService, supabase } from '@daloa/api';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { OtpVerificationModal } from '../../src/components/OtpVerificationModal';
import { QrScannerModal } from '../../src/components/QrScannerModal';
import { RunStageCard } from '../../src/components/run/RunStageCard';
import { RunIncidentModal } from '../../src/components/run/RunIncidentModal';
import { isCurfewActive } from '../../src/utils/security';
import { runStyles as styles } from '../../src/components/run/runStyles';

/**
 * Les neuf valeurs autorisées par la contrainte CHECK de `delivery_assignments.status`.
 * Le ternaire précédent n'en couvrait que deux et faisait tomber tout le reste sur
 * « Livrée » — y compris une course simplement disponible.
 */
const RUN_STAGE_LABELS: Record<string, string> = {
  pending_seller_confirmation: 'En attente du vendeur',
  awaiting_pickup: 'À accepter',
  accepted: 'Étape 1 : Ramassage',
  picked_up: 'Étape 2 : Livraison',
  in_transit: 'Étape 2 : Livraison',
  delivered: 'Livrée',
  auto_released: 'Livrée',
  disputed: 'Litige en cours',
  cancelled: 'Annulée',
};

export default function DeliveryRunExecutionScreen() {
  const { id: assignmentId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { driverLocation } = useDriverAuth();

  const [assignment, setAssignment] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedOtp, setScannedOtp] = useState('');
  const [otpType, setOtpType] = useState<'pickup' | 'delivery'>('pickup');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);

  const fetchRunData = async () => {
    if (!assignmentId) return;
    try {
      setLoading(true);
      let assignData: any = null;
      const { data: byId } = await supabase
        .from('delivery_assignments')
        .select('*')
        .eq('id', assignmentId)
        .maybeSingle();

      if (byId) {
        assignData = byId;
      } else {
        const { data: byOrder } = await supabase
          .from('delivery_assignments')
          .select('*')
          .eq('order_id', assignmentId)
          .maybeSingle();
        assignData = byOrder;
      }

      if (!assignData) throw new Error('Course introuvable');

      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select('*, seller:seller_id(*), buyer:buyer_id(*), listings:listing_id(*)')
        .eq('id', assignData.order_id)
        .single();
      if (orderErr) throw orderErr;

      setAssignment(assignData);
      setOrder(orderData);
    } catch (err: any) {
      console.error('Erreur chargement course:', err);
      showAlert('Erreur', err.message || 'Impossible de charger les détails de la course.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRunData();
  }, [assignmentId]);

  const handleCall = (phone?: string) => {
    if (!phone) {
      showAlert('Numéro indisponible', 'Aucun contact téléphonique renseigné.');
      return;
    }
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
  };

  const handleOpenGps = (address: string, lat?: number | null, lng?: number | null) => {
    if (lat && lng) {
      const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
      const latLng = `${lat},${lng}`;
      const label = encodeURIComponent(address);
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`,
      });
      if (url) Linking.openURL(url);
    } else {
      const encoded = encodeURIComponent(`${address}, Daloa, Côte d'Ivoire`);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
    }
  };

  const handleCodeScanned = (code: string) => {
    Haptics.success();
    setIsScannerOpen(false);
    setScannedOtp(code);
    setIsOtpModalOpen(true);
  };

  const handleOpenOtpModal = (type: 'pickup' | 'delivery') => {
    setOtpType(type);
    setScannedOtp('');
    setIsOtpModalOpen(true);
  };

  const handleConfirmOtp = async (otp: string, photoUri?: string) => {
    try {
      setIsVerifyingOtp(true);
      let uploadedPhotoUrl: string | undefined = undefined;

      if (photoUri) {
        uploadedPhotoUrl = await deliveryService.uploadDeliveryProof(photoUri, assignment.id);
      }

      if (otpType === 'pickup') {
        const pickupCoords =
          order?.seller?.shop_latitude != null && order?.seller?.shop_longitude != null
            ? { lat: Number(order.seller.shop_latitude), lng: Number(order.seller.shop_longitude) }
            : null;

        await deliveryService.verifyPickupOtp(
          assignment.id,
          otp,
          uploadedPhotoUrl || '',
          driverLocation || undefined,
          pickupCoords
        );
        Haptics.success();
        setIsOtpModalOpen(false);
        await fetchRunData();
        showAlert('Ramassage validé ! 🎉', 'Vous pouvez maintenant acheminer le colis chez l’acheteur.');
      } else {
        const dropoffCoords =
          order?.delivery_lat != null && order?.delivery_lng != null
            ? { lat: Number(order.delivery_lat), lng: Number(order.delivery_lng) }
            : null;

        await deliveryService.verifyDeliveryOtp(
          assignment.id,
          otp,
          uploadedPhotoUrl || '',
          driverLocation || undefined,
          dropoffCoords
        );
        Haptics.success();
        setIsOtpModalOpen(false);
        await fetchRunData();
        showAlert(
          'Livraison réussie ! 🚀',
          'Félicitations ! Vos gains ont été crédités sur votre solde.',
          [{ text: 'Voir mes courses', onPress: () => router.replace('/(tabs)/livreur') }]
        );
      }
    } catch (err: any) {
      throw err;
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleReportIncident = async (reason: string) => {
    try {
      setIsSubmittingIncident(true);
      await deliveryService.reportIncident(assignment.id, reason);
      Haptics.warning();
      setIsIncidentModalOpen(false);
      await fetchRunData();
      showAlert('Incident signalé', 'Le support logistique DaloaDelivery a été alerté.');
    } catch (err: any) {
      showAlert('Erreur', err.message || 'Impossible de signaler l’incident.');
    } finally {
      setIsSubmittingIncident(false);
    }
  };

  if (loading || !assignment || !order) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={styles.loadingText}>Chargement des données de course…</Text>
      </SafeAreaView>
    );
  }

  // `verify_pickup` écrit `in_transit`, pas `picked_up` : sans les deux valeurs ici,
  // l'écran retombait sur « Livrée » juste après un ramassage réussi et désactivait
  // les deux étapes, bloquant le livreur avant la remise.
  const isPickupStage = assignment.status === 'accepted';
  const isDeliveryStage = assignment.status === 'picked_up' || assignment.status === 'in_transit';
  const isCompleted = assignment.status === 'delivered' || assignment.status === 'auto_released';
  const deliveryPrice = Number(assignment.delivery_price ?? order?.delivery_fee ?? 500);
  const netGain = deliveryPrice - Math.round(deliveryPrice * 0.1);
  const curfew = isCurfewActive();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <ChevronLeft size={22} color={colors.text.DEFAULT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course #{assignment.id.slice(0, 8).toUpperCase()}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Alerte couvre-feu */}
        {curfew && (
          <View style={styles.curfewBanner}>
            <AlertTriangle size={18} color={colors.categories.home.text} />
            <Text style={styles.curfewText}>
              Couvre-feu logistique en vigueur (22h30 - 05h30). Soyez vigilant lors de vos déplacements.
            </Text>
          </View>
        )}

        {/* Statut & Gain Net */}
        <View style={styles.gainCard}>
          <View>
            <Text style={styles.gainLabel}>Gain Net (90%)</Text>
            <Text style={styles.gainAmount}>{formatFCFA(netGain)}</Text>
          </View>
          <View style={styles.stageStatusBadge}>
            <Text style={styles.stageStatusText}>
              {RUN_STAGE_LABELS[assignment.status] ?? 'Course indisponible'}
            </Text>
          </View>
        </View>

        {/* Étape 1 : Ramassage Vendeur */}
        <RunStageCard
          stepNumber={1}
          title="Ramassage chez le Vendeur"
          location={assignment.pickup_location || 'Quartier Vendeur'}
          partnerName={order.seller?.shop_name || order.seller?.full_name || 'Boutique Vendeur'}
          partnerPhone={order.seller?.phone || 'Non renseigné'}
          isActive={isPickupStage}
          isDone={isDeliveryStage || isCompleted}
          onCall={() => handleCall(order.seller?.phone)}
          onGps={() => handleOpenGps(assignment.pickup_location, order.seller?.shop_latitude, order.seller?.shop_longitude)}
          onScan={() => {
            setOtpType('pickup');
            setIsScannerOpen(true);
          }}
          onEnterOtp={() => handleOpenOtpModal('pickup')}
          scanButtonText="Scanner le QR code du vendeur"
        />

        {/* Étape 2 : Livraison Acheteur */}
        <RunStageCard
          stepNumber={2}
          title="Livraison chez l'Acheteur"
          location={assignment.dropoff_location || 'Quartier Destinataire'}
          partnerName={order.buyer?.full_name || 'Client Destinataire'}
          partnerPhone={order.buyer?.phone || 'Non renseigné'}
          isActive={isDeliveryStage}
          isDone={isCompleted}
          onCall={() => handleCall(order.buyer?.phone)}
          onGps={() => handleOpenGps(assignment.dropoff_location, order.delivery_lat, order.delivery_lng)}
          onScan={() => {
            setOtpType('delivery');
            setIsScannerOpen(true);
          }}
          onEnterOtp={() => handleOpenOtpModal('delivery')}
          scanButtonText="Scanner le QR code du client"
        />

        {/* Détails du colis */}
        <View style={styles.itemCard}>
          <Text style={styles.itemCardTitle}>Contenu de la commande</Text>
          <Text style={styles.itemTitle}>{order.listings?.title || 'Article commande'}</Text>
          <Text style={styles.itemSub}>
            Quantité : {order.quantity || 1} • Prix article :{' '}
            {formatFCFA(order.product_amount ?? order.total_amount ?? 0)}
          </Text>
        </View>

        {/* Bouton Signaler Incident */}
        {!isCompleted && (
          <TouchableOpacity
            onPress={() => setIsIncidentModalOpen(true)}
            style={styles.incidentBtn}
            activeOpacity={0.8}
          >
            <AlertTriangle size={16} color={colors.status.errorDark} />
            <Text style={styles.incidentBtnText}>Signaler un incident ou litige</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Scanner QR natif DaloaDelivery */}
      <QrScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        type={otpType}
        onCodeScanned={handleCodeScanned}
        onManualEntry={() => {
          setIsScannerOpen(false);
          handleOpenOtpModal(otpType);
        }}
      />

      {/* Modale OTP + Photo de preuve */}
      <OtpVerificationModal
        visible={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        type={otpType}
        initialCode={scannedOtp}
        onSubmit={handleConfirmOtp}
        loading={isVerifyingOtp}
      />

      {/* Modale Incident avec tags rapides */}
      <RunIncidentModal
        visible={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        onSubmit={handleReportIncident}
        loading={isSubmittingIncident}
      />
    </SafeAreaView>
  );
}
