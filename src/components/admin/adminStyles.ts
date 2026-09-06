import { StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '@daloa/ui';

export const REJECTION_REASONS = [
  'Document illisible',
  'Document expiré',
  'Photo non conforme au document',
  'Informations incohérentes',
];

export const DISPUTE_LABELS: Record<string, string> = {
  deliver: 'Commande marquée livrée. Vendeur et livreur seront payés.',
  cancel: 'Course annulée, la commande repasse en « payée ».',
  refund_complete: 'Acheteur remboursé intégralement.',
  refund_partial: 'Acheteur remboursé du produit, livreur payé.',
};

export const DISPUTE_CONFIRM: Record<string, string> = {
  deliver: 'Marquer la commande livrée ? Le vendeur et le livreur seront payés automatiquement.',
  cancel: 'Annuler cette course ? La commande repassera en « payée » pour réattribution.',
  refund_complete: 'Rembourser l’acheteur de la totalité (produit + livraison) ? La commande sera annulée.',
  refund_partial: 'Rembourser l’acheteur du produit uniquement, et payer le livreur pour sa course ?',
};

export const styles = StyleSheet.create({
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
