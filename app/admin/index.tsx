import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@daloa/api';
import { colors, Header, Button } from '@daloa/ui';
import { ShieldCheck, ShieldAlert, Lock, CheckCircle2 } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { styles, DISPUTE_LABELS, DISPUTE_CONFIRM } from '../../src/components/admin/adminStyles';
import { EmptyRow } from '../../src/components/admin/EmptyRow';
import { DriverVerificationCard, DriverRow } from '../../src/components/admin/DriverVerificationCard';
import {
  DisputeResolutionCard,
  DisputeRow,
  DisputeAction,
} from '../../src/components/admin/DisputeResolutionCard';

type Mode = 'drivers' | 'disputes';

export default function AdminScreen() {
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useDriverAuth();

  const [mode, setMode] = useState<Mode>('drivers');
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    const [d, a] = await Promise.all([
      supabase
        .from('delivery_persons')
        .select('id, name, phone, photo_url, cni_url, vehicle_type, verification_status, is_verified, created_at')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('delivery_assignments')
        .select('id, order_id, status, dispute_reason, disputed_at, delivery_person_id, dropoff_location')
        .eq('status', 'disputed')
        .order('disputed_at', { ascending: false })
        .limit(50),
    ]);
    setDrivers((d.data as DriverRow[]) || []);
    setDisputes((a.data as DisputeRow[]) || []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (!authLoading && isAdmin) load();
    else if (!authLoading) setLoading(false);
  }, [authLoading, isAdmin, load]);

  const pending = drivers.filter(
    (d) => d.verification_status === 'pending' || (d.cni_url && !d.verification_status)
  );

  const setVerification = async (
    driver: DriverRow,
    approved: boolean,
    reason?: string
  ) => {
    setActing(driver.id);
    try {
      const { error } = await supabase
        .from('delivery_persons')
        .update({
          is_verified: approved,
          verification_status: approved ? 'approved' : 'rejected',
          verification_rejection_reason: approved ? null : reason || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', driver.id);

      if (error) throw error;

      const { data: fresh } = await supabase
        .from('delivery_persons')
        .select('verification_status')
        .eq('id', driver.id)
        .maybeSingle();

      const expected = approved ? 'approved' : 'rejected';
      if (fresh && (fresh as any).verification_status !== expected) {
        throw new Error("La base a refusé la modification : droits d'administration insuffisants.");
      }

      Haptics.success();
      setRejectingId(null);
      setRejectReason('');
      await load();
      Alert.alert(
        approved ? 'Livreur vérifié' : 'Document refusé',
        approved
          ? `${driver.name || 'Le livreur'} peut désormais prendre des courses.`
          : `${driver.name || 'Le livreur'} a été notifié du motif.`
      );
    } catch (err: any) {
      Alert.alert('Échec', err?.message || 'Action impossible.');
    } finally {
      setActing(null);
    }
  };

  const resolveDispute = async (dispute: DisputeRow, action: DisputeAction) => {
    setActing(dispute.id);
    try {
      const { data, error } = await supabase.rpc('resolve_delivery_dispute', {
        p_assignment_id: dispute.id,
        p_action: action,
      });
      if (error) throw error;

      const res = data as { success?: boolean; reason?: string } | null;
      if (res && res.success === false) {
        throw new Error(
          res.reason === 'unauthorized'
            ? "Vous n'avez pas les droits de médiation."
            : res.reason || 'Résolution refusée.'
        );
      }

      Haptics.success();
      await load();
      Alert.alert('Litige résolu', DISPUTE_LABELS[action]);
    } catch (err: any) {
      Alert.alert('Échec', err?.message || 'Résolution impossible.');
    } finally {
      setActing(null);
    }
  };

  const confirmDispute = (dispute: DisputeRow, action: DisputeAction) => {
    Alert.alert('Confirmer la décision', DISPUTE_CONFIRM[action], [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', style: 'destructive', onPress: () => resolveDispute(dispute, action) },
    ]);
  };

  if (!authLoading && !isAdmin) {
    return (
      <SafeAreaView style={styles.screen}>
        <Header title="Administration" onBack={() => router.back()} />
        <View style={styles.denied}>
          <View style={styles.deniedIcon}>
            <Lock size={26} color={colors.status.errorDark} />
          </View>
          <Text style={styles.deniedTitle}>Accès réservé</Text>
          <Text style={styles.deniedText}>
            Cette console est réservée à l’équipe DaloaDelivery.
          </Text>
          <Button title="Retour" variant="delivery" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Header
        title="Administration"
        subtitle={mode === 'drivers' ? 'Vérification des livreurs' : 'Litiges de livraison'}
        onBack={() => router.back()}
      />

      <View style={styles.segment}>
        <TouchableOpacity
          onPress={() => setMode('drivers')}
          style={[styles.segmentItem, mode === 'drivers' && styles.segmentItemOn]}
        >
          <ShieldCheck size={15} color={mode === 'drivers' ? colors.text.inverse : colors.text.muted} />
          <Text style={[styles.segmentLabel, mode === 'drivers' && styles.segmentLabelOn]}>
            Livreurs {pending.length > 0 ? `(${pending.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode('disputes')}
          style={[styles.segmentItem, mode === 'disputes' && styles.segmentItemOn]}
        >
          <ShieldAlert size={15} color={mode === 'disputes' ? colors.text.inverse : colors.text.muted} />
          <Text style={[styles.segmentLabel, mode === 'disputes' && styles.segmentLabelOn]}>
            Litiges {disputes.length > 0 ? `(${disputes.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.status.infoDark} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
        >
          {mode === 'drivers' ? (
            pending.length === 0 ? (
              <EmptyRow
                icon={<CheckCircle2 size={22} color={colors.status.success} />}
                title="Aucun dossier en attente"
                text={`${drivers.length} livreur(s) enregistré(s), tous traités.`}
              />
            ) : (
              pending.map((d) => (
                <DriverVerificationCard
                  key={d.id}
                  driver={d}
                  acting={acting}
                  rejectingId={rejectingId}
                  rejectReason={rejectReason}
                  onSetRejectingId={setRejectingId}
                  onSetRejectReason={setRejectReason}
                  onVerify={setVerification}
                />
              ))
            )
          ) : disputes.length === 0 ? (
            <EmptyRow
              icon={<CheckCircle2 size={22} color={colors.status.success} />}
              title="Aucun litige ouvert"
              text="Toutes les courses se sont conclues normalement."
            />
          ) : (
            disputes.map((a) => (
              <DisputeResolutionCard
                key={a.id}
                dispute={a}
                acting={acting}
                onConfirmDispute={confirmDispute}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
