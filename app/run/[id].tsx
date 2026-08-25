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
  Header,
  Card,
  Button,
  CurrencyText,
  StatusPill,
  BottomSheet,
  Input,
} from '@daloa/ui';
import {
  MapPin,
  Navigation,
  PhoneCall,
  ShieldCheck,
  KeyRound,
  Camera,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react-native';
import { OtpVerificationModal } from '../../src/components/OtpVerificationModal';
import { formatWhatsAppPhone, isWithinOtpProximity, Haptics } from '@daloa/utils';

export default function DeliveryRunExecutionScreen() {
  const { id: assignmentId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { driverProfile, driverLocation } = useDriverAuth();

  const [assignment, setAssignment] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Course en direct" onBack={() => router.back()} />
        <View style={{ padding: spacing[4] }}>
          <Text style={{ color: colors.dark.text }}>Chargement des données de la course...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isPickupStage = assignment.status === 'accepted';
  const isDeliveryStage = assignment.status === 'picked_up' || assignment.status === 'in_transit';
  const isCompleted = assignment.status === 'delivered';
  const netGain = (assignment.delivery_price || 0) - (assignment.driver_fee || 0);

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

  const handleStartPickup = () => {
    setOtpType('pickup');
    setIsOtpModalOpen(true);
  };

  const handleStartDelivery = () => {
    setOtpType('delivery');
    setIsOtpModalOpen(true);
  };

  const handleConfirmOtp = async (otp: string, photoUri: string) => {
    try {
      setIsVerifyingOtp(true);

      // 1. Upload photo de preuve vers Supabase Storage
      const uploadedPhotoUrl = await deliveryService.uploadDeliveryProof(photoUri);

      // 2. Validation OTP selon l'étape
      if (otpType === 'pickup') {
        await deliveryService.verifyPickupOtp(
          assignment.id,
          otp,
          uploadedPhotoUrl,
          driverLocation || undefined
        );
        Haptics.success();
        setIsOtpModalOpen(false);
        await fetchRunData();
        Alert.alert('Ramassage validé !', 'Vous pouvez maintenant acheminer le colis chez l’acheteur.');
      } else {
        await deliveryService.verifyDeliveryOtp(
          assignment.id,
          otp,
          uploadedPhotoUrl,
          driverLocation || undefined
        );
        Haptics.success();
        setIsOtpModalOpen(false);
        await fetchRunData();
        Alert.alert('Livraison réussie ! 🎉', `Félicitations ! Vos gains de ${netGain} FCFA ont été crédités sur votre solde.`);
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={`Course #${assignment.id.slice(0, 8).toUpperCase()}`}
        onBack={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Statut & Gains */}
        <Card variant="glowDelivery" style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.gainLabel}>Votre Gain Net</Text>
              <CurrencyText
                amount={netGain}
                size="2xl"
                weight="extrabold"
                color={colors.delivery.primary}
              />
            </View>
            <StatusPill status={assignment.status} size="md" />
          </View>
        </Card>

        {/* Étape 1 : Ramassage Vendeur */}
        <Card
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
            {isDeliveryStage && <CheckCircle2 size={20} color="#10B981" />}
          </View>

          <View style={styles.partnerInfo}>
            <Text style={styles.partnerName}>
              {order.seller?.shop_name || order.seller?.full_name || 'Boutique Vendeur'}
            </Text>
            <Text style={styles.partnerPhone}>📞 {order.seller?.phone || 'Numéro indisponible'}</Text>
          </View>

          {isPickupStage && (
            <View style={styles.actionRow}>
              <Button
                title="Appeler Vendeur"
                variant="secondary"
                size="sm"
                leftIcon={<PhoneCall size={16} color={colors.dark.text} />}
                onPress={handleCallSeller}
                style={{ flex: 1 }}
              />
              <Button
                title="Itinéraire GPS"
                variant="outline"
                size="sm"
                leftIcon={<Navigation size={16} color={colors.delivery.primary} />}
                onPress={() => handleOpenGpsNavigation(assignment.pickup_location)}
                style={{ flex: 1 }}
              />
            </View>
          )}

          {isPickupStage && (
            <Button
              title="Valider le Ramassage (Code OTP)"
              variant="delivery"
              size="lg"
              onPress={handleStartPickup}
              leftIcon={<KeyRound size={18} color="#090D16" />}
              style={{ marginTop: spacing[3] }}
            />
          )}
        </Card>

        {/* Étape 2 : Livraison Acheteur */}
        <Card
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
            {isCompleted && <CheckCircle2 size={20} color="#10B981" />}
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
              <Button
                title="Appeler Acheteur"
                variant="secondary"
                size="sm"
                leftIcon={<PhoneCall size={16} color={colors.dark.text} />}
                onPress={handleCallBuyer}
                style={{ flex: 1 }}
              />
              <Button
                title="Itinéraire GPS"
                variant="outline"
                size="sm"
                leftIcon={<Navigation size={16} color={colors.delivery.primary} />}
                onPress={() => handleOpenGpsNavigation(assignment.dropoff_location)}
                style={{ flex: 1 }}
              />
            </View>
          )}

          {isDeliveryStage && (
            <Button
              title="Valider la Livraison (Code OTP)"
              variant="delivery"
              size="lg"
              onPress={handleStartDelivery}
              leftIcon={<ShieldCheck size={18} color="#090D16" />}
              style={{ marginTop: spacing[3] }}
            />
          )}
        </Card>

        {/* Détail Colis */}
        <Card style={styles.itemCard}>
          <Text style={styles.itemCardTitle}>Détails du Colis</Text>
          <Text style={styles.itemTitle}>
            📦 {order.listing?.title || 'Colis Marchandise'}
          </Text>
          <Text style={styles.itemSub}>Quantité : x{order.quantity || 1}</Text>
        </Card>

        {/* Signalement Problème / Incident */}
        {!isCompleted && (
          <TouchableOpacity
            onPress={() => setIsIncidentModalOpen(true)}
            style={styles.incidentBtn}
          >
            <AlertTriangle size={16} color={colors.status.error} />
            <Text style={styles.incidentBtnText}>Signaler un incident (Client absent, refus...)</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modale OTP + Photo */}
      <OtpVerificationModal
        visible={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        type={otpType}
        onSubmit={handleConfirmOtp}
        isLoading={isVerifyingOtp}
      />

      {/* Modale Déclaration d'Incident */}
      <BottomSheet
        visible={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        title="Signaler un incident de course"
      >
        <Text style={styles.incidentModalSub}>
          Précisez la nature du problème (ex: vendeur fermé, client injoignable, adresse introuvable).
        </Text>
        <Input
          label="Description de l'incident *"
          placeholder="Détaillez le problème..."
          value={incidentReason}
          onChangeText={setIncidentReason}
          multiline
          numberOfLines={4}
          inputStyle={{ minHeight: 90, textAlignVertical: 'top' }}
        />
        <Button
          title="Transmettre au support"
          variant="danger"
          loading={isSubmittingIncident}
          onPress={handleReportIncident}
          style={{ marginTop: spacing[3] }}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[3],
  },
  headerCard: {
    padding: spacing[4],
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gainLabel: {
    color: colors.dark.textDim,
    fontSize: typography.sizes.xs,
    marginBottom: 2,
  },
  stageCard: {
    padding: spacing[4],
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    gap: spacing[2],
  },
  stageCardActive: {
    borderColor: colors.delivery.primary,
    backgroundColor: 'rgba(6, 182, 212, 0.06)',
  },
  stageCardDone: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    opacity: 0.85,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  stageBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.dark.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageBadgeActive: {
    backgroundColor: colors.delivery.primary,
  },
  stageBadgeText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  stageTitle: {
    color: colors.dark.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  stageDistrict: {
    color: colors.dark.textDim,
    fontSize: 11,
  },
  partnerInfo: {
    backgroundColor: colors.dark.surfaceRaised,
    borderRadius: radii.xl,
    padding: spacing[3],
    marginVertical: 4,
    gap: 2,
  },
  partnerName: {
    color: colors.dark.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  partnerPhone: {
    color: colors.dark.textMuted,
    fontSize: typography.sizes.xs,
  },
  partnerAddress: {
    color: colors.dark.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: 4,
  },
  itemCard: {
    padding: spacing[4],
    gap: 2,
  },
  itemCardTitle: {
    color: colors.dark.textDim,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemTitle: {
    color: colors.dark.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginTop: 2,
  },
  itemSub: {
    color: colors.dark.textMuted,
    fontSize: typography.sizes.xs,
  },
  incidentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing[3],
  },
  incidentBtnText: {
    color: colors.status.error,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  incidentModalSub: {
    color: colors.dark.textMuted,
    fontSize: typography.sizes.xs,
    lineHeight: 16,
    marginBottom: spacing[3],
  },
});
