import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@daloa/api';
import { colors, radii, spacing, AppText, AppPressable, Button, useAccent, showAlert } from '@daloa/ui';
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2, Scale, Truck, ExternalLink, XCircle, User } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { EmptyRow } from '../../src/components/admin/EmptyRow';
import { DriverVerificationCard, DriverRow } from '../../src/components/admin/DriverVerificationCard';

type Filter = 'pending' | 'approved' | 'rejected';

const MARKET_ADMIN = 'https://daloamarket.com/admin';

const statusOf = (d: DriverRow): Filter | 'none' => {
  if (d.verification_status === 'approved') return 'approved';
  if (d.verification_status === 'rejected') return 'rejected';
  if (d.verification_status === 'pending' || (d.cni_url && !d.verification_status) || (d.cni_url && d.verification_status === 'none')) {
    return 'pending';
  }
  return 'none';
};

/**
 * Console DaloaDelivery : la vérification des livreurs, son vrai rôle.
 * L'arbitrage des litiges et le suivi des courses se font dans l'admin
 * DaloaMarket (un seul endroit) : cet écran en avait une copie avec ses
 * propres boutons.
 */
export default function AdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accent = useAccent();
  const { isAdmin, isLoading: authLoading } = useDriverAuth();

  const [drivers, setDrivers] = useState<(DriverRow & { verification_rejection_reason?: string | null })[]>([]);
  const [filter, setFilter] = useState<Filter>('pending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('delivery_persons')
      .select('id, name, phone, photo_url, cni_url, licence_url, vehicle_type, verification_status, verification_rejection_reason, is_verified, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    setDrivers((data as any[]) || []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (!authLoading && isAdmin) load();
    else if (!authLoading) setLoading(false);
  }, [authLoading, isAdmin, load]);

  const setVerification = async (driver: DriverRow, approved: boolean, reason?: string) => {
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

      // La base annule en silence une écriture non autorisée : on relit.
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
      showAlert(
        approved ? 'Livreur vérifié' : 'Document refusé',
        approved
          ? `${driver.name || 'Le livreur'} peut désormais prendre des courses.`
          : `${driver.name || 'Le livreur'} a été notifié du motif.`
      );
    } catch (err: any) {
      showAlert('Échec', err?.message || 'Action impossible.');
    } finally {
      setActing(null);
    }
  };

  if (!authLoading && !isAdmin) {
    return (
      <View style={[styles.screen, styles.denied, { paddingTop: insets.top + spacing[10] }]}>
        <View style={styles.deniedIcon}>
          <Lock size={26} color={colors.status.errorDark} />
        </View>
        <AppText variant="title">Accès réservé</AppText>
        <AppText variant="body" color={colors.text.muted} style={styles.centerText}>
          Cette console est réservée à l’équipe DaloaDelivery.
        </AppText>
        <Button title="Retour" variant="delivery" onPress={() => router.back()} />
      </View>
    );
  }

  const counts = {
    pending: drivers.filter((d) => statusOf(d) === 'pending').length,
    approved: drivers.filter((d) => statusOf(d) === 'approved').length,
    rejected: drivers.filter((d) => statusOf(d) === 'rejected').length,
  };
  const visible = drivers.filter((d) => statusOf(d) === filter);
  const stats: { key: Filter; label: string }[] = [
    { key: 'pending', label: 'En attente' },
    { key: 'approved', label: 'Vérifiés' },
    { key: 'rejected', label: 'Refusés' },
  ];

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[accent[400], accent[600], accent[700]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + spacing[2] }]}
      >
        <View style={styles.heroRow}>
          <AppPressable onPress={() => router.back()} rippleBorderless style={styles.backBtn} accessibilityLabel="Retour">
            <ArrowLeft size={18} color={colors.text.inverse} />
          </AppPressable>
          <View style={styles.flex}>
            <AppText variant="caption" color={accent[100]}>Administration</AppText>
            <AppText variant="title" color={colors.text.inverse}>Vérification des livreurs</AppText>
          </View>
          <ShieldCheck size={20} color={accent[100]} />
        </View>

        {/* Compteurs = filtres */}
        <View style={styles.statsRow}>
          {stats.map((st) => (
            <AppPressable
              key={st.key}
              haptic="selection"
              onPress={() => setFilter(st.key)}
              style={[styles.statTile, filter === st.key && styles.statTileOn]}
              accessibilityLabel={`${st.label} : ${counts[st.key]}`}
            >
              <AppText variant="h2" color={colors.text.inverse} style={styles.tnum}>{counts[st.key]}</AppText>
              <AppText variant="caption" color={accent[50]}>{st.label}</AppText>
            </AppPressable>
          ))}
        </View>
      </LinearGradient>

      {/* Litiges et courses : gérés dans l'admin DaloaMarket */}
      <View style={styles.linksCard}>
        {[
          { label: 'Litiges', icon: Scale, path: '/litiges' },
          { label: 'Livraisons', icon: Truck, path: '/livraisons' },
        ].map(({ label, icon: Icon, path }) => (
          <AppPressable key={label} onPress={() => Linking.openURL(`${MARKET_ADMIN}${path}`)} style={styles.linkItem}>
            <View style={[styles.linkIcon, { backgroundColor: accent[50] }]}>
              <Icon size={17} color={accent.DEFAULT} />
            </View>
            <AppText variant="bodyStrong" style={styles.flex}>{label}</AppText>
            <ExternalLink size={14} color={colors.grey[400]} />
          </AppPressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={accent.DEFAULT} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing[8] }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor={accent.DEFAULT}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
        >
          {visible.length === 0 ? (
            <EmptyRow
              icon={<CheckCircle2 size={22} color={colors.status.success} />}
              title={filter === 'pending' ? 'Aucun dossier en attente' : 'Aucun livreur'}
              text={`${drivers.length} livreur(s) enregistré(s).`}
            />
          ) : filter === 'pending' ? (
            visible.map((d) => (
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
          ) : (
            visible.map((d) => (
              <View key={d.id} style={styles.row}>
                <View style={styles.rowIcon}>
                  <User size={18} color={colors.grey[500]} />
                </View>
                <View style={styles.flex}>
                  <AppText variant="bodyStrong" numberOfLines={1}>{d.name || 'Livreur'}</AppText>
                  <AppText variant="caption" color={colors.text.muted}>
                    {d.phone || '—'} · {d.vehicle_type || '—'}
                  </AppText>
                  {filter === 'rejected' && d.verification_rejection_reason ? (
                    <AppText variant="caption" color={colors.status.errorDark}>{d.verification_rejection_reason}</AppText>
                  ) : null}
                </View>
                {filter === 'approved' ? (
                  <CheckCircle2 size={18} color={colors.status.success} />
                ) : (
                  <XCircle size={18} color={colors.status.error} />
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.DEFAULT },
  flex: { flex: 1 },
  tnum: { fontVariant: ['tabular-nums'] },
  centerText: { textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[10],
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[4] },
  statTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  statTileOn: { backgroundColor: 'rgba(255,255,255,0.32)' },
  linksCard: {
    flexDirection: 'row',
    gap: spacing[2],
    marginHorizontal: spacing[4],
    marginTop: -spacing[8],
    padding: spacing[2],
    borderRadius: radii['2xl'],
    backgroundColor: colors.bg.surface,
    shadowColor: '#7C2D12',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  linkItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[2],
    borderRadius: radii.lg,
  },
  linkIcon: { width: 34, height: 34, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing[4], gap: spacing[3] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.bg.surface,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.bg.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  denied: { alignItems: 'center', paddingHorizontal: spacing[6], gap: spacing[3] },
  deniedIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.status.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
