import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, RotateCcw } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '@daloa/ui';

const PICKUP_TIMEOUT_MS = 210 * 60 * 1000; // 3h30

export interface RunPickupDeadlineBannerProps {
  acceptedAt?: string | null;
  createdAt?: string | null;
  onReleasePress: () => void;
  releasing?: boolean;
}

function formatRemainingTime(acceptedAt?: string | null, createdAt?: string | null): {
  label: string;
  isUrgent: boolean;
} {
  const baseIso = acceptedAt || createdAt;
  if (!baseIso) {
    return { label: 'À récupérer chez le vendeur sous 3h30 max', isUrgent: false };
  }

  const startMs = new Date(baseIso).getTime();
  if (Number.isNaN(startMs)) {
    return { label: 'À récupérer chez le vendeur sous 3h30 max', isUrgent: false };
  }

  const remainingMs = Math.max(0, startMs + PICKUP_TIMEOUT_MS - Date.now());
  const totalMinutes = Math.ceil(remainingMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (totalMinutes <= 0) {
    return { label: 'Délai dépassé · Remise en ligne imminente', isUrgent: true };
  }

  const timeStr = hours > 0 ? `${hours}h${String(minutes).padStart(2, '0')}` : `${minutes} min`;
  return {
    label: `Retrait vendeur : ${timeStr} restantes avant remise en ligne`,
    isUrgent: totalMinutes <= 45,
  };
}

export const RunPickupDeadlineBanner: React.FC<RunPickupDeadlineBannerProps> = ({
  acceptedAt,
  createdAt,
  onReleasePress,
  releasing = false,
}) => {
  const [status, setStatus] = useState(() => formatRemainingTime(acceptedAt, createdAt));

  useEffect(() => {
    setStatus(formatRemainingTime(acceptedAt, createdAt));
    const timer = setInterval(() => {
      setStatus(formatRemainingTime(acceptedAt, createdAt));
    }, 30000);
    return () => clearInterval(timer);
  }, [acceptedAt, createdAt]);

  return (
    <View style={[styles.banner, status.isUrgent && styles.bannerUrgent]}>
      <View style={styles.infoRow}>
        <Clock size={15} color={status.isUrgent ? '#B45309' : colors.grey[700]} />
        <Text style={[styles.deadlineText, status.isUrgent && styles.deadlineTextUrgent]}>
          {status.label}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onReleasePress}
        disabled={releasing}
        activeOpacity={0.8}
        style={styles.releaseBtn}
      >
        <RotateCcw size={13} color="#B45309" />
        <Text style={styles.releaseBtnText}>
          {releasing ? 'Remise en ligne…' : 'Se désister / Remettre la course en ligne'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radii.xl,
    padding: spacing[3],
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  bannerUrgent: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deadlineText: {
    flex: 1,
    fontSize: 12,
    fontFamily: typography.families.semibold,
    color: '#92400E',
    fontVariant: ['tabular-nums'],
  },
  deadlineTextUrgent: {
    fontFamily: typography.families.bold,
    color: '#78350F',
  },
  releaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: radii.lg,
    paddingVertical: 8,
    paddingHorizontal: spacing[3],
  },
  releaseBtnText: {
    fontSize: 12,
    fontFamily: typography.families.bold,
    color: '#B45309',
  },
});

