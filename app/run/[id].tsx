import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, AlertTriangle } from 'lucide-react-native';
import { colors, showAlert, BuyerReliabilityBadge, GroupedStopsTimeline } from '@daloa/ui';
import { formatFCFA, Haptics } from '@daloa/utils';
import { deliveryService, antiLapinService, groupedDeliveryService } from '@daloa/api';
import { CodRefusalReason, GroupedPickupStop } from '@daloa/types';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { OtpVerificationModal } from '../../src/components/OtpVerificationModal';
import { QrScannerModal } from '../../src/components/QrScannerModal';
import { RunStageCard } from '../../src/components/run/RunStageCard';
import { RunIncidentModal } from '../../src/components/run/RunIncidentModal';
import { CodRefusalModal } from '../../src/components/run/CodRefusalModal';
import { isCurfewActive } from '../../src/utils/security';
import { makePhoneCall, openExternalGps } from '../../src/utils/navigationHelper';
import { driverLocationTracker } from '../../src/services/driverLocationTracker';
import { useDeliveryRun } from '../../src/hooks/useDeliveryRun';
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

  const {
    assignment,
    order,
    loading,
    isDemo,
    setDemoStatus,
    fetchRunData,
    reportIncident,
    isSubmittingIncident,
  } = useDeliveryRun(assignmentId);

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedOtp, setScannedOtp] = useState('');
  const [otpType, setOtpType] = useState<'pickup' | 'delivery'>('pickup');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isCodRefusalModalOpen, setIsCodRefusalModalOpen] = useState(false);
  const [isReportingRefusal, setIsReportingRefusal] = useState(false);
  const [confirmingStopIndex, setConfirmingStopIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!assignment?.id) return;
    if (['accepted', 'picked_up', 'in_transit'].includes(assignment.status)) {
      const stop = driverLocationTracker.startTracking(assignment.id);
      return () => stop();
    }
    driverLocationTracker.stopTracking();
  }, [assignment?.id, assignment?.status]);

  useEffect(() => () => driverLocationTracker.stopTracking(), []);

  const handleOpenOtpModal = (type: 'pickup' | 'delivery') => {
    setOtpType(type);
    setScannedOtp(isDemo ? '123456' : '');
    setIsOtpModalOpen(true);
  };

  const handleCodeScanned = (code: string) => {
    Haptics.success();
    setIsScannerOpen(false);
    setScannedOtp(code);
    setIsOtpModalOpen(true);
  };

  const handleConfirmGroupedStop = async (stop: GroupedPickupStop) => {
    if (!assignment?.id) return;
    try {
      setConfirmingStopIndex(stop.stopIndex);
      const res = await groupedDeliveryService.confirmPickupStop(
        assignment.id,
        stop.stopIndex,
        stop.sellerId
      );
      Haptics.success();
      await fetchRunData();
      showAlert(
        res.allCompleted ? 'Tous les arrêts validés ! 🎉' : 'Arrêt validé !',
        res.allCompleted
          ? 'Tous les colis ont été récupérés. En route vers le client !'
          : `Retrait ${res.completedStops}/${res.totalStops} enregistré.`
      );
    } catch (err: any) {
      showAlert('Erreur', err.message || 'Impossible de valider cet arrêt.');
    } finally {
      setConfirmingStopIndex(null);
    }
  };

  const handleConfirmOtp = async (otp: string, photoUri?: string, photoBase64?: string | null) => {
    if (isDemo) {
      setIsVerifyingOtp(true);
      setTimeout(() => {
        setIsVerifyingOtp(false);
        Haptics.success();
        setIsOtpModalOpen(false);
        if (otpType === 'pickup') {
          setDemoStatus('in_transit');
          showAlert('Ramassage validé ! 🎉', 'Colis récupéré chez le vendeur. Dirigez-vous vers l’acheteur (Code: 123456).');
        } else {
          setDemoStatus('delivered');
          showAlert('Livraison réussie ! 🚀', 'Félicitations ! Vos gains de 1 350 FCFA ont été crédités.', [
            { text: 'Voir mes courses', onPress: () => router.replace('/(tabs)/livreur') },
          ]);
        }
      }, 400);
      return;
    }

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
        showAlert('Ramassage validé ! 🎉', 'Vous pouvez maintenant acheminer le colis chez le destinataire.');
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

  const isExpress = Boolean(assignment?.is_express || (order as any)?.order_type === 'express');
  const isCashOnDelivery = Boolean(order?.payment_method && order.payment_method !== 'online' && !isExpress);

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
            if (isDemo) {
              setDemoStatus('delivered');
              Haptics.success();
              showAlert('Livraison démo validée', 'Encaissement démo enregistré.', [
                { text: 'Voir mes courses', onPress: () => router.replace('/(tabs)/livreur') },
              ]);
              return;
            }
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

  const handleCodRefusalSubmit = async (reason: CodRefusalReason, notes?: string) => {
    if (!order) return;
    try {
      setIsReportingRefusal(true);
      await antiLapinService.reportCodRefusal({ orderId: order.id, reason, notes });
      Haptics.warning();
      setIsCodRefusalModalOpen(false);
      showAlert(
        'Incident Anti-Lapin enregistré',
        'La commande a été clôturée et votre responsabilité est dégagée.',
        [{ text: 'Voir mes courses', onPress: () => router.replace('/(tabs)/livreur') }]
      );
    } catch (err: any) {
      showAlert('Erreur', err.message || 'Impossible d’enregistrer le refus.');
    } finally {
      setIsReportingRefusal(false);
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

  const isPickupStage = assignment.status === 'accepted';
  const isDeliveryStage = assignment.status === 'picked_up' || assignment.status === 'in_transit';
  const isCompleted = assignment.status === 'delivered' || assignment.status === 'auto_released';
  const deliveryPrice = Number(assignment.delivery_price ?? order?.delivery_fee ?? 500);
  const netGain = deliveryPrice - Math.round(deliveryPrice * 0.1);
  const curfew = isCurfewActive(isDemo);
  const orderItems = Array.isArray(order.order_items) && order.order_items.length > 0 ? order.order_items : null;
  const senderPhone = isExpress ? (assignment.sender_phone || order.sender_phone) : order.seller?.phone;
  const recipientPhone = isExpress ? (assignment.recipient_phone || order.recipient_phone) : order.buyer?.phone;

  const isGenericPickup =
    !assignment.pickup_location ||
    assignment.pickup_location.toLowerCase() === 'boutique du vendeur' ||
    assignment.pickup_location.toLowerCase() === 'boutique';

  const sellerDistrict =
    order.seller?.district ||
    order.listings?.district ||
    assignment.sender_district ||
    null;

  const pickupLocation = isGenericPickup
    ? (order.seller?.shop_name || order.seller?.full_name || 'Boutique du vendeur')
    : assignment.pickup_location;

  const buyerDistrict =
    order.buyer?.district ||
    assignment.recipient_district ||
    null;

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
            <Text style={styles.gainLabel}>{isExpress ? 'Gain Net Express (90%)' : 'Gain Net (90%)'}</Text>
            <Text style={styles.gainAmount}>{formatFCFA(netGain)}</Text>
          </View>
          <View style={styles.stageStatusBadge}>
            <Text style={styles.stageStatusText}>{RUN_STAGE_LABELS[assignment.status] ?? 'Course indisponible'}</Text>
          </View>
        </View>

        {assignment.is_grouped && Array.isArray(assignment.grouped_stops) && assignment.grouped_stops.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <GroupedStopsTimeline
              stops={assignment.grouped_stops.map((s: any, idx: number) => ({
                stopIndex: Number(s.stop_index) || idx + 1,
                sellerId: s.seller_id,
                shopName: s.shop_name || s.seller_name || 'Boutique',
                address: s.address || s.pickup_address,
                district: s.district,
                status: s.status === 'picked_up' ? 'picked_up' : 'pending',
              }))}
              dropoffAddress={assignment.dropoff_location || 'Adresse client'}
              totalStops={Number(assignment.group_total_stops) || assignment.grouped_stops.length}
              completedStops={Number(assignment.group_completed_stops) || 0}
              onConfirmStop={isPickupStage ? handleConfirmGroupedStop : undefined}
              confirmingStopIndex={confirmingStopIndex}
            />
          </View>
        )}

        <RunStageCard
          stepNumber={1}
          title={isExpress ? "Ramassage chez l'Expéditeur" : 'Ramassage chez le Vendeur'}
          district={sellerDistrict}
          location={pickupLocation || 'Quartier Vendeur'}
          partnerName={isExpress ? (assignment.sender_name || order.sender_name || 'Expéditeur') : (order.seller?.shop_name || order.seller?.full_name || 'Boutique Vendeur')}
          partnerPhone={senderPhone || 'Non renseigné'}
          isActive={isPickupStage}
          isDone={isDeliveryStage || isCompleted}
          onCall={() => makePhoneCall(senderPhone)}
          onGps={() => openExternalGps(pickupLocation, isExpress ? assignment.pickup_lat : order.seller?.shop_latitude, isExpress ? assignment.pickup_lng : order.seller?.shop_longitude)}
          onScan={() => { setOtpType('pickup'); setIsScannerOpen(true); }}
          onEnterOtp={() => handleOpenOtpModal('pickup')}
          scanButtonText={isExpress ? "Scanner le code de l'expéditeur" : 'Scanner le QR code du vendeur'}
        />

        <RunStageCard
          stepNumber={2}
          title={isExpress ? 'Livraison au Destinataire' : "Livraison chez l'Acheteur"}
          district={buyerDistrict}
          location={assignment.dropoff_location || 'Quartier Destinataire'}
          partnerName={isExpress ? (assignment.recipient_name || order.recipient_name || 'Destinataire') : (order.buyer?.full_name || 'Client Destinataire')}
          partnerPhone={recipientPhone || 'Non renseigné'}
          isActive={isDeliveryStage}
          isDone={isCompleted}
          onCall={() => makePhoneCall(recipientPhone)}
          onGps={() => openExternalGps(assignment.dropoff_location, isExpress ? assignment.dropoff_lat : order.delivery_lat, isExpress ? assignment.dropoff_lng : order.delivery_lng)}
          onScan={() => { setOtpType('delivery'); setIsScannerOpen(true); }}
          onEnterOtp={() => handleOpenOtpModal('delivery')}
          scanButtonText={isExpress ? 'Scanner le code du destinataire' : 'Scanner le QR code du client'}
          primaryAction={
            isCashOnDelivery
              ? { title: `Livré et encaissé · ${formatFCFA(Number(order.total_amount) || 0)}`, onPress: handleConfirmCashDelivery }
              : undefined
          }
          secondaryAction={
            isCashOnDelivery && isDeliveryStage && !isCompleted
              ? { title: 'Signaler un refus / Injoignable', onPress: () => setIsCodRefusalModalOpen(true), variant: 'outline' }
              : undefined
          }
          reliabilityBadge={
            !isExpress && order.buyer ? (
              <BuyerReliabilityBadge
                compact
                score={order.buyer.cod_reliability_score}
                tier={
                  (order.buyer.cod_refused_count ?? 0) >= 2
                    ? 'at_risk'
                    : (order.buyer.cod_refused_count ?? 0) === 1
                    ? 'warning'
                    : (order.buyer.cod_delivered_count ?? 0) === 0
                    ? 'new_client'
                    : 'verified'
                }
              />
            ) : undefined
          }
        />

        <View style={styles.itemCard}>
          <Text style={styles.itemCardTitle}>{isExpress ? 'Format du colis (sécurisé)' : 'Contenu de la commande'}</Text>
          {isExpress ? (
            <>
              <Text style={styles.itemTitle}>{assignment.package_description || order.package_description || 'Colis scellé standard'}</Text>
              <Text style={styles.itemSub}>
                {`Course Express • Règlement : ${assignment.payer_role === 'recipient' ? `Encaisser ${formatFCFA(deliveryPrice)} chez le destinataire` : "Encaisser au départ auprès de l'expéditeur"}`}
              </Text>
            </>
          ) : orderItems ? (
            orderItems.map((it: any, idx: number) => (
              <View key={it.id || idx} style={{ marginTop: idx > 0 ? 6 : 0 }}>
                <Text style={styles.itemTitle}>{it.listings?.title || order.listings?.title || 'Article'}</Text>
                <Text style={styles.itemSub}>Quantité : {it.quantity || 1} • {formatFCFA(it.product_amount ?? it.unit_price ?? 0)}</Text>
              </View>
            ))
          ) : (
            <>
              <Text style={styles.itemTitle}>{order.listings?.title || 'Article commandé'}</Text>
              <Text style={styles.itemSub}>Quantité : {order.quantity || 1} • Prix article : {formatFCFA(order.product_amount ?? order.total_amount ?? 0)}</Text>
            </>
          )}
        </View>

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
        isDemo={isDemo}
      />
      <RunIncidentModal
        visible={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        onSubmit={reportIncident}
        loading={isSubmittingIncident}
      />
      <CodRefusalModal
        visible={isCodRefusalModalOpen}
        onClose={() => setIsCodRefusalModalOpen(false)}
        onSubmit={handleCodRefusalSubmit}
        loading={isReportingRefusal}
      />
    </SafeAreaView>
  );
}
