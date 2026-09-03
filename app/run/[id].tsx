import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { deliveryService, ordersService, supabase } from '@daloa/api';
import {
  colors,
  radii,
  spacing,
  typography,
  Button,
  BottomSheet,
} from '@daloa/ui';
import {
  MapPin,
  Navigation,
  PhoneCall,
  ShieldCheck,
  KeyRound,
  ScanLine,
  Camera,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react-native';
import { OtpVerificationModal } from '../../src/components/OtpVerificationModal';
import { QrScannerModal } from '../../src/components/QrScannerModal';
import { formatFCFA, Haptics } from '@daloa/utils';

export default function DeliveryRunExecutionScreen() {
  const { id: assignmentId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { driverProfile, driverLocation } = useDriverAuth();

  const [assignment, setAssignment] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedOtp, setScannedOtp] = useState('');
  const [otpType, setOtpType] = useState<'pickup' | 'delivery'>('pickup');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incidentReason, setIncidentReason] = useState('');
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);

  const fetchRunData = async () => {
    if (!assignmentId) return;
    try {
      const { data: assign, error: aErr } = await supabase
        .from('delivery_assignments')
        .select('*')
        .eq('id', assignmentId)
        .single();

      if (aErr) throw aErr;
      setAssignment(assign);

      if (assign?.order_id) {
        const { data: ord, error: oErr } = await supabase
          .from('orders')
          .select('*, seller:seller_id(*), buyer:buyer_id(*), listing:listing_id(*)')
          .eq('id', assign.order_id)
          .single();

        if (oErr) throw oErr;
        setOrder(ord);
      }
    } catch (err) {
      console.warn('Erreur chargement course:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRunData();

    if (assignmentId) {
      const channel = ordersService.subscribeToOrderUpdates(assignmentId, () => {
        fetchRunData();
      });
      return () => {
        channel.unsubscribe();
      };
    }
  }, [assignmentId]);

  if (loading || !assignment || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Course en direct</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des détails de la course...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isPickupStage = assignment.status === 'accepted';
  const isDeliveryStage = assignment.status === 'picked_up' || assignment.status === 'in_transit';
  const isCompleted = assignment.status === 'delivered';
  const netGain = Math.round((assignment.delivery_price || 500) * 0.9);

  const handleOpenGpsNavigation = (locationStr: string) => {
    Haptics.lightImpact();
    const query = encodeURIComponent(`${locationStr}, Daloa, Côte d'Ivoire`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    Linking.openURL(url as string);
  };

  const handleCallSeller = () => {
    if (!order.seller?.phone) return;
    Haptics.lightImpact();
    Linking.openURL(`tel:${order.seller.phone}`);
  };

  const handleCallBuyer = () => {
    if (!order.buyer_phone && !order.buyer?.phone) return;
    Haptics.lightImpact();
    Linking.openURL(`tel:${order.buyer_phone || order.buyer?.phone}`);
  };

  // Ouvre le scanner QR en priorité (moderne, rapide)
  const handleStartPickup = () => {
    setOtpType('pickup');
    setIsScannerOpen(true);
  };

  const handleStartDelivery = () => {
    setOtpType('delivery');
    setIsScannerOpen(true);
  };

  // Fallback : saisie manuelle du code OTP
  const handleManualEntry = () => {
    setIsOtpModalOpen(true);
  };

  // Code scanné via QR -> on enchaîne sur la photo de preuve via la modale OTP
  const handleCodeScanned = (code: string) => {
    setScannedOtp(code);
    setIsScannerOpen(false);
    setIsOtpModalOpen(true); // on réutilise la modale (photo de preuve + confirmation)
  };

  const handleConfirmOtp = async (otp: string, photoUri: string) => {
    try {
      setIsVerifyingOtp(true);

      const uploadedPhotoUrl = await deliveryService.uploadDeliveryProof(photoUri);

      if (otpType === 'pickup') {
        const sellerCoords =
          order?.seller?.shop_latitude != null && order?.seller?.shop_longitude != null
            ? { lat: Number(order.seller.shop_latitude), lng: Number(order.seller.shop_longitude) }
            : null;

        await deliveryService.verifyPickupOtp(
          assignment.id,
          otp,
          uploadedPhotoUrl,
          driverLocation || undefined,
          sellerCoords
        );
        Haptics.success();
        setIsOtpModalOpen(false);
        await fetchRunData();
        Alert.alert('Ramassage validé ! 🎉', 'Vous pouvez maintenant acheminer le colis chez l’acheteur.');
      } else {
        const dropoffCoords =
          order?.delivery_lat != null && order?.delivery_lng != null
            ? { lat: Number(order.delivery_lat), lng: Number(order.delivery_lng) }
            : null;

        await deliveryService.verifyDeliveryOtp(
          assignment.id,
          otp,
          uploadedPhotoUrl,
          driverLocation || undefined,
          dropoffCoords
        );
        Haptics.success();
        setIsOtpModalOpen(false);
        await fetchRunData();
        Alert.alert('Livraison réussie ! 🚀', `Félicitations ! Vos gains de ${formatFCFA(netGain)} ont été crédités.`);
      }
    } catch (err: any) {
      throw err;
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleReportIncident = async () => {
    if (!incidentReason.trim()) return;
    try {
      setIsSubmittingIncident(true);
      await deliveryService.reportIncident(assignment.id, incidentReason.trim());
      Haptics.warning();
      setIsIncidentModalOpen(false);
      await fetchRunData();
      Alert.alert('Incident signalé', 'Le support logistique DaloaDelivery a été alerté.');
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de signaler l’incident.');
    } finally {
      setIsSubmittingIncident(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Course #{assignment.id.slice(0, 8).toUpperCase()}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Statut & Gain Net */}
        <View style={styles.gainCard}>
          <View>
            <Text style={styles.gainLabel}>Gain Net (90%)</Text>
            <Text style={styles.gainAmount}>{formatFCFA(netGain)}</Text>
          </View>
          <View style={styles.stageStatusBadge}>
            <Text style={styles.stageStatusText}>
              {isPickupStage ? 'Étape 1 : Ramassage' : isDeliveryStage ? 'Étape 2 : Livraison' : 'Livrée'}
            </Text>
          </View>
        </View>

        {/* Étape 1 : Ramassage Vendeur */}
        <View
          style={[
            styles.stageCard,
            isPickupStage && styles.stageCardActive,
            isDeliveryStage && styles.stageCardDone,
          ]}
        >
          <View style={styles.stageHeader}>
            <View style={[styles.stageBadge, isPickupStage && styles.stageBadgeActive]}>
              <Text style={styles.stageBadgeText}>1</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stageTitle}>Ramassage chez le Vendeur</Text>
              <Text style={styles.stageDistrict}>📍 {assignment.pickup_location}</Text>
            </View>
            {isDeliveryStage && <CheckCircle2 size={20} color="#059669" />}
          </View>

          <View style={styles.partnerInfo}>
            <Text style={styles.partnerName}>
              {order.seller?.shop_name || order.seller?.full_name || 'Boutique Vendeur'}
            </Text>
            <Text style={styles.partnerPhone}>📞 {order.seller?.phone || 'Numéro indisponible'}</Text>
          </View>

          {isPickupStage && (
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={handleCallSeller} style={styles.actionBtnOutline}>
                <PhoneCall size={15} color="#059669" />
                <Text style={[styles.actionBtnOutlineText, { color: '#059669' }]}>Appeler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleOpenGpsNavigation(assignment.pickup_location)}
                style={styles.actionBtnOutline}
              >
                <Navigation size={15} color={colors.primary[600]} />
                <Text style={[styles.actionBtnOutlineText, { color: colors.primary[600] }]}>GPS</Text>
              </TouchableOpacity>
            </View>
          )}

          {isPickupStage && (
            <View style={{ marginTop: 12 }}>
              <Button
                title="Scanner le QR code du vendeur"
                variant="primary"
                size="lg"
                onPress={handleStartPickup}
                leftIcon={<ScanLine size={18} color="#FFFFFF" />}
                fullWidth
              />
            </View>
          )}
        </View>

        {/* Étape 2 : Livraison Acheteur */}
        <View
          style={[
            styles.stageCard,
            isDeliveryStage && styles.stageCardActive,
            isCompleted && styles.stageCardDone,
          ]}
        >
          <View style={styles.stageHeader}>
            <View style={[styles.stageBadge, isDeliveryStage && styles.stageBadgeActive]}>
              <Text style={styles.stageBadgeText}>2</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stageTitle}>Livraison chez l'Acheteur</Text>
              <Text style={styles.stageDistrict}>📍 {assignment.dropoff_location}</Text>
            </View>
            {isCompleted && <CheckCircle2 size={20} color="#059669" />}
          </View>

          <View style={styles.partnerInfo}>
            <Text style={styles.partnerName}>
              {order.buyer?.full_name || 'Client DaloaMarket'}
            </Text>
            <Text style={styles.partnerPhone}>
              📞 {order.buyer_phone || order.buyer?.phone || 'Numéro indisponible'}
            </Text>
            {order.delivery_address && (
              <Text style={styles.partnerAddress}>
                Repère : {order.delivery_address}
              </Text>
            )}
          </View>

          {isDeliveryStage && (
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={handleCallBuyer} style={styles.actionBtnOutline}>
                <PhoneCall size={15} color="#0066CC" />
                <Text style={[styles.actionBtnOutlineText, { color: '#0066CC' }]}>Appeler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleOpenGpsNavigation(assignment.dropoff_location)}
                style={styles.actionBtnOutline}
              >
                <Navigation size={15} color={colors.primary[600]} />
                <Text style={[styles.actionBtnOutlineText, { color: colors.primary[600] }]}>GPS</Text>
              </TouchableOpacity>
            </View>
          )}

          {isDeliveryStage && (
            <View style={{ marginTop: 12 }}>
              <Button
                title="Scanner le QR code de l'acheteur"
                variant="secondary"
                size="lg"
                onPress={handleStartDelivery}
                leftIcon={<ScanLine size={18} color="#FFFFFF" />}
                fullWidth
              />
            </View>
          )}
        </View>

        {/* Détails du Colis */}
        <View style={styles.itemCard}>
          <Text style={styles.itemCardTitle}>Contenu du Colis</Text>
          <Text style={styles.itemTitle}>
            📦 {order.listing?.title || 'Marchandise DaloaMarket'}
          </Text>
          <Text style={styles.itemSub}>Quantité : x{order.quantity || 1}</Text>
        </View>

        {/* Signalement Problème / Incident */}
        {!isCompleted && (
          <TouchableOpacity
            onPress={() => setIsIncidentModalOpen(true)}
            style={styles.incidentBtn}
          >
            <AlertTriangle size={15} color={colors.status.error} />
            <Text style={styles.incidentBtnText}>Signaler un incident (Client absent, refus...)</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Scanner QR — validation instantanée */}
      <QrScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        type={otpType}
        onCodeScanned={handleCodeScanned}
        onManualEntry={handleManualEntry}
      />

      {/* Modale OTP + Photo (fallback saisie / confirmation après scan) */}
      <OtpVerificationModal
        visible={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        type={otpType}
        initialCode={scannedOtp}
        onSubmit={handleConfirmOtp}
        loading={isVerifyingOtp}
      />

      {/* Modale Incident */}
      <BottomSheet
        visible={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        title="Signaler un incident de livraison"
      >
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 13, color: colors.grey[600], marginBottom: 12 }}>
            Indiquez la raison du blocage (Destinataire injoignable, adresse introuvable, incident sur la route).
          </Text>
          <TextInput
            style={styles.incidentInput}
            multiline
            numberOfLines={4}
            placeholder="Détails de l’incident..."
            value={incidentReason}
            onChangeText={setIncidentReason}
          />
          <View style={{ marginTop: 16 }}>
            <Button
              title="Transmettre l'incident"
              variant="danger"
              onPress={handleReportIncident}
              loading={isSubmittingIncident}
              fullWidth
            />
          </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 13,
    color: colors.grey[500],
    fontWeight: '600',
  },
  scrollContent: {
    padding: 14,
    backgroundColor: '#F8F9FA',
  },
  gainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  gainLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.grey[500],
    textTransform: 'uppercase',
  },
  gainAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary[600],
    marginTop: 2,
  },
  stageStatusBadge: {
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  stageStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary[700],
  },
  stageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  stageCardActive: {
    borderColor: colors.primary.DEFAULT,
    borderWidth: 1.5,
  },
  stageCardDone: {
    backgroundColor: '#F9FAFB',
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  stageBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageBadgeActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  stageBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  stageTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
  },
  stageDistrict: {
    fontSize: 11.5,
    color: colors.grey[600],
    marginTop: 1,
  },
  partnerInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: radii.lg,
    padding: 10,
    marginVertical: 6,
    gap: 2,
  },
  partnerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  partnerPhone: {
    fontSize: 12,
    color: colors.grey[600],
  },
  partnerAddress: {
    fontSize: 11.5,
    color: colors.primary[700],
    fontWeight: '600',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionBtnOutline: {
    flex: 1,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  itemCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.grey[800],
  },
  itemSub: {
    fontSize: 11.5,
    color: colors.grey[500],
    marginTop: 2,
  },
  incidentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: radii.lg,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  incidentBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.status.error,
  },
  incidentInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: radii.lg,
    padding: 10,
    fontSize: 13,
    textAlignVertical: 'top',
  },
});
