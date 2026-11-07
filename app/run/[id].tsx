import { colors, showAlert } from '@daloa/ui';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, AlertTriangle } from 'lucide-react-native';
import { formatFCFA, Haptics } from '@daloa/utils';
import {
  deliveryService,
  supabase,
  PUBLIC_USER_COLUMNS,
  SAFE_DELIVERY_ASSIGNMENT_COLUMNS,
  attachContactPhones,
} from '@daloa/api';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { OtpVerificationModal } from '../../src/components/OtpVerificationModal';
import { QrScannerModal } from '../../src/components/QrScannerModal';
import { RunStageCard } from '../../src/components/run/RunStageCard';
import { RunIncidentModal } from '../../src/components/run/RunIncidentModal';
import { RunPickupDeadlineBanner } from '../../src/components/run/RunPickupDeadlineBanner';
import { RunOrderSummaryCard } from '../../src/components/run/RunOrderSummaryCard';
import { isCurfewActive } from '../../src/utils/security';
import { makePhoneCall, openExternalGps } from '../../src/utils/navigationHelper';
import { runStyles as styles } from '../../src/components/run/runStyles';

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
  const [isReleasingRun, setIsReleasingRun] = useState(false);

  const fetchRunData = useCallback(async () => {
    if (!assignmentId) return;

    try {
      setLoading(true);
      const { data: byId } = await supabase
        .from('delivery_assignments')
        .select(SAFE_DELIVERY_ASSIGNMENT_COLUMNS)
        .eq('id', assignmentId)
        .maybeSingle();

      let assignData: any = byId;
      if (!assignData) {
        const { data: byOrder } = await supabase
          .from('delivery_assignments')
          .select(SAFE_DELIVERY_ASSIGNMENT_COLUMNS)
          .eq('order_id', assignmentId)
          .maybeSingle();
        assignData = byOrder;
      }
      if (!assignData) throw new Error('Course introuvable');

      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select(
          `*, seller:seller_id(${PUBLIC_USER_COLUMNS}), buyer:buyer_id(${PUBLIC_USER_COLUMNS}), listings:listing_id(*), order_items(id, quantity, unit_price, product_amount, selected_variants, listings:listing_id(title, photos))`
        )
        .eq('id', assignData.order_id)
        .single();
      if (orderErr) throw orderErr;

      await attachContactPhones([(orderData as any).seller, (orderData as any).buyer]);
      setAssignment(assignData);
      setOrder(orderData);
    } catch (err: any) {
      showAlert('Erreur', err.message || 'Impossible de charger les détails de la course.');
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchRunData();
  }, [fetchRunData]);

  useEffect(() => {
    if (!assignment?.id) return;
    const channel = supabase
      .channel(`driver-run-${assignment.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'delivery_assignments', filter: `id=eq.${assignment.id}` },
        (payload) => {
          const next = payload.new as any;
          setAssignment((prev: any) => (prev ? { ...prev, ...next } : next));
          if (next.status === 'cancelled') {
            Haptics.warning();
            showAlert('Course annulée', 'La commande associée a été annulée. Ne vous déplacez plus.');
          } else if (next.status === 'disputed') {
            Haptics.warning();
            showAlert('Litige ouvert', 'Un litige a été ouvert sur cette course.');
          } else if (next.status === 'awaiting_pickup' && !next.delivery_person_id) {
            Haptics.warning();
            showAlert('Course remise en ligne', 'Cette course a été remise à disposition des autres livreurs.', [
              { text: 'Retour', onPress: () => router.replace('/(tabs)/livreur') },
            ]);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [assignment?.id, router]);

  const handleOpenOtpModal = (type: 'pickup' | 'delivery') => {
    setOtpType(type);
    setScannedOtp('');
    setIsOtpModalOpen(true);
  };

  const handleCodeScanned = (code: string) => {
    Haptics.success();
    setIsScannerOpen(false);
    setScannedOtp(code);
    setIsOtpModalOpen(true);
  };

  const handleConfirmOtp = async (otp: string, photoUri?: string, photoBase64?: string | null) => {
    try {
      setIsVerifyingOtp(true);
      const uploadedPhotoUrl = photoUri
        ? await deliveryService.uploadDeliveryProof({ fileUri: photoUri, base64: photoBase64 }, assignment.id)
        : '';

      if (otpType === 'pickup') {
        const pickupCoords =
          order?.seller?.shop_latitude != null && order?.seller?.shop_longitude != null
            ? { lat: Number(order.seller.shop_latitude), lng: Number(order.seller.shop_longitude) }
            : null;
        await deliveryService.verifyPickupOtp(assignment.id, otp, uploadedPhotoUrl, driverLocation || undefined, pickupCoords);
        Haptics.success();
        setIsOtpModalOpen(false);
        await fetchRunData();
        showAlert('Ramassage validé ! 🎉', 'Vous pouvez maintenant acheminer le colis chez l’acheteur.');
      } else {
        const dropoffCoords =
          order?.delivery_lat != null && order?.delivery_lng != null
            ? { lat: Number(order.delivery_lat), lng: Number(order.delivery_lng) }
            : null;
        await deliveryService.verifyDeliveryOtp(assignment.id, otp, uploadedPhotoUrl, driverLocation || undefined, dropoffCoords);
        Haptics.success();
        setIsOtpModalOpen(false);
        await fetchRunData();
        showAlert('Livraison réussie ! 🚀', 'Félicitations ! Vos gains ont été crédités sur votre solde.', [
          { text: 'Voir mes courses', onPress: () => router.replace('/(tabs)/livreur') },
        ]);
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const isCashOnDelivery = Boolean(order?.payment_method && order.payment_method !== 'online');

  const handleConfirmCashDelivery = () => {
    const amount = Number(order?.total_amount) || 0;
    showAlert(
      'Livré et encaissé ?',
      `Confirmez que vous avez remis le colis et encaissé ${formatFCFA(amount)} auprès du client.`,
      [
        { text: 'Pas encore', style: 'cancel' },
        {
          text: 'Oui, encaissé',
          onPress: async () => {
            try {
              setIsVerifyingOtp(true);
              const dropoffCoords =
                order?.delivery_lat != null && order?.delivery_lng != null
                  ? { lat: Number(order.delivery_lat), lng: Number(order.delivery_lng) }
                  : null;
              await deliveryService.verifyDeliveryOtp(assignment.id, '', '', driverLocation || undefined, dropoffCoords);
              Haptics.success();
              await fetchRunData();
              showAlert(
                'Livraison validée',
                `L'encaissement de ${formatFCFA(amount)} est enregistré. Remettez au vendeur sa part selon votre accord.`,
                [{ text: 'Voir mes courses', onPress: () => router.replace('/(tabs)/livreur') }]
              );
            } catch (err: any) {
              showAlert('Validation impossible', err.message || 'Réessayez dans un instant.');
            } finally {
              setIsVerifyingOtp(false);
            }
          },
        },
      ]
    );
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

  const handleReleaseRun = () => {
    showAlert(
      'Annuler ma prise en charge ?',
      'La course sera immédiatement remise en ligne pour qu’un autre livreur puisse aller récupérer le colis chez le vendeur.',
      [
        { text: 'Garder la course', style: 'cancel' },
        {
          text: 'Remettre en ligne',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsReleasingRun(true);
              await deliveryService.releaseRun(assignment.id, 'driver_released');
              Haptics.warning();
              showAlert('Course remise en ligne', 'La course est de nouveau disponible pour les autres livreurs.', [
                { text: 'Retour', onPress: () => router.replace('/(tabs)/livreur') },
              ]);
            } catch (err: any) {
              showAlert('Erreur', err.message || 'Impossible de libérer cette course.');
            } finally {
              setIsReleasingRun(false);
            }
          },
        },
      ]
    );
  };

  if (loading || !assignment || !order) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={styles.loadingText}>Chargement des données de course…</Text>
      </SafeAreaView>
    );
  }

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
        {curfew && (
          <View style={styles.curfewBanner}>
            <AlertTriangle size={18} color={colors.categories.home.text} />
            <Text style={styles.curfewText}>
              Couvre-feu logistique en vigueur (22h30 - 05h30). Soyez vigilant lors de vos déplacements.
            </Text>
          </View>
        )}

        <View style={styles.gainCard}>
          <View>
            <Text style={styles.gainLabel}>Gain Net (90%)</Text>
            <Text style={styles.gainAmount}>{formatFCFA(netGain)}</Text>
          </View>
          <View style={styles.stageStatusBadge}>
            <Text style={styles.stageStatusText}>{RUN_STAGE_LABELS[assignment.status] ?? 'Course indisponible'}</Text>
          </View>
        </View>

        {isPickupStage && (
          <RunPickupDeadlineBanner
            acceptedAt={assignment.accepted_at}
            createdAt={assignment.created_at}
            isReleasing={isReleasingRun}
            onRelease={handleReleaseRun}
          />
        )}

        <RunStageCard
          stepNumber={1}
          title="Ramassage chez le Vendeur"
          location={assignment.pickup_location || 'Quartier Vendeur'}
          partnerName={order.seller?.shop_name || order.seller?.full_name || 'Boutique Vendeur'}
          partnerPhone={order.seller?.phone || 'Non renseigné'}
          isActive={isPickupStage}
          isDone={isDeliveryStage || isCompleted}
          onCall={() => makePhoneCall(order.seller?.phone)}
          onGps={() => openExternalGps(assignment.pickup_location, order.seller?.shop_latitude, order.seller?.shop_longitude)}
          onScan={() => { setOtpType('pickup'); setIsScannerOpen(true); }}
          onEnterOtp={() => handleOpenOtpModal('pickup')}
          scanButtonText="Scanner le QR code du vendeur"
        />

        <RunStageCard
          stepNumber={2}
          title="Livraison chez l'Acheteur"
          location={assignment.dropoff_location || 'Quartier Destinataire'}
          partnerName={order.buyer?.full_name || 'Client Destinataire'}
          partnerPhone={order.buyer?.phone || 'Non renseigné'}
          isActive={isDeliveryStage}
          isDone={isCompleted}
          onCall={() => makePhoneCall(order.buyer?.phone)}
          onGps={() => openExternalGps(assignment.dropoff_location, order.delivery_lat, order.delivery_lng)}
          onScan={() => { setOtpType('delivery'); setIsScannerOpen(true); }}
          onEnterOtp={() => handleOpenOtpModal('delivery')}
          scanButtonText="Scanner le QR code du client"
          primaryAction={
            isCashOnDelivery
              ? { title: `Livré et encaissé · ${formatFCFA(Number(order.total_amount) || 0)}`, onPress: handleConfirmCashDelivery }
              : undefined
          }
        />

        <RunOrderSummaryCard order={order} />

        {!isCompleted && assignment.status !== 'cancelled' && (
          <TouchableOpacity onPress={() => setIsIncidentModalOpen(true)} style={styles.incidentBtn} activeOpacity={0.8}>
            <AlertTriangle size={16} color={colors.status.errorDark} />
            <Text style={styles.incidentBtnText}>Signaler un incident ou litige</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <QrScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        type={otpType}
        onCodeScanned={handleCodeScanned}
        onManualEntry={() => { setIsScannerOpen(false); handleOpenOtpModal(otpType); }}
      />
      <OtpVerificationModal
        visible={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        type={otpType}
        initialCode={scannedOtp}
        onSubmit={handleConfirmOtp}
        loading={isVerifyingOtp}
      />
      <RunIncidentModal
        visible={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        onSubmit={handleReportIncident}
        loading={isSubmittingIncident}
      />
    </SafeAreaView>
  );
}
