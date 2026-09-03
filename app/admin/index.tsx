import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@daloa/api';
import { colors, radii, spacing, typography, Header, Button } from '@daloa/ui';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Bike,
} from 'lucide-react-native';
import { Haptics } from '@daloa/utils';
import { useDriverAuth } from '../../src/context/DriverAuthContext';

type Mode = 'drivers' | 'disputes';

interface DriverRow {
  id: string;
  name: string | null;
  phone: string | null;
  photo_url: string | null;
  cni_url: string | null;
  vehicle_type: string | null;
  verification_status: string | null;
  is_verified: boolean | null;
  created_at: string;
}

interface DisputeRow {
  id: string;
  order_id: string;
  status: string;
  dispute_reason: string | null;
  disputed_at: string | null;
  delivery_person_id: string | null;
  dropoff_location: string | null;
}

const REJECTION_REASONS = [
  'Document illisible',
  'Document expiré',
  'Photo non conforme au document',
  'Informations incohérentes',
];

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
    // La RLS filtre : un non-admin obtient une liste vide plutôt qu'une erreur.
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

      // La policy laisse passer l'UPDATE mais le trigger restaure les colonnes
      // sensibles pour un non-admin : on relit pour confirmer l'effet réel
      // plutôt que d'annoncer un succès qui n'a pas eu lieu.
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

  const resolveDispute = async (
    dispute: DisputeRow,
    action: 'deliver' | 'cancel' | 'refund_complete' | 'refund_partial'
  ) => {
    setActing(dispute.id);
    try {
      const { data, error } = await supabase.rpc('resolve_delivery_dispute', {
        p_assignment_id: dispute.id,
        p_action: action,
      });
      if (error) throw error;

      // Cette RPC renvoie { success: false, reason } dans le corps.
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

  const confirmDispute = (
    dispute: DisputeRow,
    action: 'deliver' | 'cancel' | 'refund_complete' | 'refund_partial'
  ) => {
    Alert.alert('Confirmer la décision', DISPUTE_CONFIRM[action], [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', style: 'destructive', onPress: () => resolveDispute(dispute, action) },
    ]);
  };

  // ── Accès refusé ─────────────────────────────────────────────────────────
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

      {/* Sélecteur de volet */}
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
                <View key={d.id} style={styles.card}>
                  <View style={styles.cardHead}>
                    <View style={styles.cardIcon}>
                      <Bike size={16} color={colors.status.infoDark} />
                    </View>
                    <View style={styles.cardHeadText}>
                      <Text style={styles.cardTitle}>{d.name || 'Sans nom'}</Text>
                      <Text style={styles.cardMeta}>
                        {d.phone || 'Téléphone manquant'}
                        {d.vehicle_type ? ` · ${d.vehicle_type}` : ''}
                      </Text>
                    </View>
                  </View>

                  {d.cni_url ? (
                    <TouchableOpacity
                      style={styles.docLink}
                      onPress={() => Linking.openURL(d.cni_url as string)}
                    >
                      <FileText size={14} color={colors.status.infoDark} />
                      <Text style={styles.docLinkText}>Ouvrir la pièce d’identité</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.warnText}>Aucun document transmis.</Text>
                  )}

                  {rejectingId === d.id ? (
                    <View style={styles.rejectBox}>
                      <Text style={styles.rejectLabel}>Motif du refus</Text>
                      {REJECTION_REASONS.map((r) => (
                        <TouchableOpacity
                          key={r}
                          onPress={() => setRejectReason(r)}
                          style={[styles.reasonChip, rejectReason === r && styles.reasonChipOn]}
                        >
                          <Text
                            style={[
                              styles.reasonChipText,
                              rejectReason === r && styles.reasonChipTextOn,
                            ]}
                          >
                            {r}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <TextInput
                        style={styles.input}
                        placeholder="Autre motif…"
                        placeholderTextColor={colors.text.subtle}
                        value={REJECTION_REASONS.includes(rejectReason) ? '' : rejectReason}
                        onChangeText={setRejectReason}
                        multiline
                      />
                      <View style={styles.actionRow}>
                        <Button
                          title="Annuler"
                          variant="secondary"
                          onPress={() => {
                            setRejectingId(null);
                            setRejectReason('');
                          }}
                          style={styles.flexBtn}
                        />
                        <Button
                          title="Confirmer le refus"
                          variant="danger"
                          loading={acting === d.id}
                          onPress={() => {
                            if (!rejectReason.trim()) {
                              Alert.alert('Motif requis', 'Indiquez la raison du refus.');
                              return;
                            }
                            setVerification(d, false, rejectReason.trim());
                          }}
                          style={styles.flexBtn}
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.actionRow}>
                      <Button
                        title="Refuser"
                        variant="secondary"
                        onPress={() => {
                          setRejectingId(d.id);
                          setRejectReason('');
                        }}
                        leftIcon={<XCircle size={15} color={colors.status.error} />}
                        style={styles.flexBtn}
                      />
                      <Button
                        title="Vérifier"
                        variant="delivery"
                        loading={acting === d.id}
                        onPress={() => setVerification(d, true)}
                        leftIcon={<CheckCircle2 size={15} color={colors.text.inverse} />}
                        style={styles.flexBtn}
                      />
                    </View>
                  )}
                </View>
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
              <View key={a.id} style={styles.card}>
                <View style={styles.cardHead}>
                  <View style={[styles.cardIcon, styles.cardIconWarn]}>
                    <AlertTriangle size={16} color={colors.status.warningDark} />
                  </View>
                  <View style={styles.cardHeadText}>
                    <Text style={styles.cardTitle}>
                      {a.dispute_reason === 'too_many_otp_attempts'
                        ? 'Trop de tentatives de code'
                        : a.dispute_reason || 'Litige signalé'}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {a.dropoff_location || 'Adresse non renseignée'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.hint}>
                  « Livrer » paie le vendeur et le livreur. « Rembourser » rend l’argent
                  à l’acheteur. Ces décisions déplacent de l’argent réel.
                </Text>

                <View style={styles.actionRow}>
                  <Button
                    title="Livrer"
                    variant="delivery"
                    loading={acting === a.id}
                    onPress={() => confirmDispute(a, 'deliver')}
                    style={styles.flexBtn}
                  />
                  <Button
                    title="Annuler"
                    variant="secondary"
                    onPress={() => confirmDispute(a, 'cancel')}
                    style={styles.flexBtn}
                  />
                </View>
                <View style={styles.actionRow}>
                  <Button
                    title="Remb. total"
                    variant="danger"
                    onPress={() => confirmDispute(a, 'refund_complete')}
                    style={styles.flexBtn}
                  />
                  <Button
                    title="Remb. partiel"
                    variant="danger"
                    onPress={() => confirmDispute(a, 'refund_partial')}
                    style={styles.flexBtn}
                  />
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const DISPUTE_LABELS: Record<string, string> = {
  deliver: 'Commande marquée livrée. Vendeur et livreur seront payés.',
  cancel: 'Course annulée, la commande repasse en « payée ».',
  refund_complete: 'Acheteur remboursé intégralement.',
  refund_partial: 'Acheteur remboursé du produit, livreur payé.',
};

const DISPUTE_CONFIRM: Record<string, string> = {
  deliver:
    'Marquer la commande livrée ? Le vendeur et le livreur seront payés automatiquement.',
  cancel: 'Annuler cette course ? La commande repassera en « payée » pour réattribution.',
  refund_complete:
    'Rembourser l’acheteur de la totalité (produit + livraison) ? La commande sera annulée.',
  refund_partial:
    'Rembourser l’acheteur du produit uniquement, et payer le livreur pour sa course ?',
};

function EmptyRow({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.empty}>
      {icon}
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.DEFAULT },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing[4], gap: spacing[3], paddingBottom: spacing[12] },

  segment: {
    flexDirection: 'row',
    margin: spacing[4],
    marginBottom: 0,
    padding: 3,
    gap: 3,
    borderRadius: radii.lg,
    backgroundColor: colors.bg.subtle,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    borderRadius: radii.md,
  },
  segmentItemOn: { backgroundColor: colors.status.infoDark },
  segmentLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.bold,
    color: colors.text.muted,
  },
  segmentLabelOn: { color: colors.text.inverse },

  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing[4],
    gap: spacing[3],
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.status.infoLight,
  },
  cardIconWarn: { backgroundColor: colors.status.warningLight },
  cardHeadText: { flex: 1, gap: 2 },
  cardTitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.families.bold,
    color: colors.text.DEFAULT,
  },
  cardMeta: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.normal,
    color: colors.text.muted,
  },

  docLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: radii.md,
    backgroundColor: colors.status.infoLight,
  },
  docLinkText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.bold,
    color: colors.status.infoDark,
  },
  warnText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.normal,
    color: colors.status.warningDark,
  },
  hint: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.families.normal,
    color: colors.text.muted,
    lineHeight: 17,
  },

  actionRow: { flexDirection: 'row', gap: spacing[2] },
  flexBtn: { flex: 1 },

  rejectBox: { gap: spacing[2] },
  rejectLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.bold,
    color: colors.text.body,
  },
  reasonChip: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.bg.subtle,
  },
  reasonChipOn: {
    borderColor: colors.status.error,
    backgroundColor: colors.status.errorLight,
  },
  reasonChipText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.normal,
    color: colors.text.body,
  },
  reasonChipTextOn: { color: colors.status.errorDark },
  input: {
    minHeight: 56,
    padding: spacing[3],
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.bg.subtle,
    color: colors.text.DEFAULT,
    fontSize: typography.sizes.sm,
    textAlignVertical: 'top',
  },

  empty: {
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[6],
  },
  emptyTitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.families.bold,
    color: colors.text.DEFAULT,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.normal,
    color: colors.text.muted,
    textAlign: 'center',
  },

  denied: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3], padding: spacing[6] },
  deniedIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.status.errorLight,
  },
  deniedTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.families.bold,
    color: colors.text.DEFAULT,
  },
  deniedText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.normal,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
