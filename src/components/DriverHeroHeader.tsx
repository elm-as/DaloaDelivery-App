import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { Zap, RefreshCw, Bike, User } from 'lucide-react-native';
import { colors, radii, spacing, AppText, AppPressable, typography } from '@daloa/ui';

interface DriverHeroHeaderProps {
  driverProfile: any;
  isOnline: boolean;
  onToggleOnline: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const DriverHeroHeader: React.FC<DriverHeroHeaderProps> = ({
  driverProfile,
  isOnline,
  onToggleOnline,
  onRefresh,
  isRefreshing,
}) => {
  const insets = useSafeAreaInsets();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Bonjour' : currentHour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const firstName = (driverProfile?.name || 'Livreur').split(' ')[0];
  const vehicle = (driverProfile?.vehicle_type || 'moto').toUpperCase();

  return (
    <LinearGradient
      colors={[colors.primary[400], colors.primary.DEFAULT, colors.primary[700]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + spacing[3] }]}
    >
      {/* 1. Ligne supérieure : Profil & Actualiser */}
      <View style={styles.topRow}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarWrap}>
            {driverProfile?.photo_url ? (
              <ExpoImage
                source={{ uri: driverProfile.photo_url }}
                style={styles.avatarImg}
                contentFit="cover"
              />
            ) : (
              <View style={styles.fallbackAvatar}>
                <User size={24} color={colors.text.inverse} />
              </View>
            )}
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOnline ? colors.status.success : colors.text.subtle },
              ]}
            />
          </View>

          <View>
            <AppText variant="caption" color="rgba(255, 255, 255, 0.85)" style={styles.greetingText}>
              {greeting}
            </AppText>
            <View style={styles.nameRow}>
              <AppText variant="h2" color={colors.text.inverse} numberOfLines={1} style={styles.driverName}>
                {firstName} 👋
              </AppText>
              <View style={styles.vehicleBadge}>
                <Bike size={11} color={colors.text.inverse} />
                <AppText variant="caption" color={colors.text.inverse} style={styles.vehicleText}>
                  {vehicle}
                </AppText>
              </View>
            </View>
          </View>
        </View>

        <AppPressable
          haptic="light"
          onPress={onRefresh}
          disabled={isRefreshing}
          style={styles.refreshBtn}
          accessibilityLabel="Actualiser les courses"
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <RefreshCw size={17} color={colors.text.inverse} />
          )}
        </AppPressable>
      </View>

      {/* 2. Bannière interactive En Ligne / Hors Ligne */}
      <AppPressable
        haptic="medium"
        onPress={onToggleOnline}
        style={[
          styles.statusBanner,
          {
            backgroundColor: isOnline ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.22)',
            borderColor: isOnline ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.15)',
          },
        ]}
        accessibilityLabel={isOnline ? 'Passer hors ligne' : 'Passer en ligne'}
      >
        <View style={styles.statusLeft}>
          <View
            style={[
              styles.zapIconWrap,
              { backgroundColor: isOnline ? colors.status.success : 'rgba(255, 255, 255, 0.18)' },
            ]}
          >
            <Zap size={20} color={colors.text.inverse} strokeWidth={2.5} />
          </View>

          <View>
            <View style={styles.statusTitleRow}>
              <AppText variant="bodyStrong" color={colors.text.inverse} style={styles.statusTitle}>
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </AppText>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: isOnline ? '#D1FAE5' : 'rgba(255, 255, 255, 0.2)' },
                ]}
              >
                <AppText
                  variant="caption"
                  color={isOnline ? colors.status.successDark : colors.text.inverse}
                  style={styles.statusPillText}
                >
                  {isOnline ? 'ACTIF' : 'PAUSE'}
                </AppText>
              </View>
            </View>

            <AppText variant="caption" color="rgba(255, 255, 255, 0.85)">
              {isOnline
                ? 'Prêt à recevoir les courses à Daloa'
                : 'Touchez pour activer la réception'}
            </AppText>
          </View>
        </View>

        <View style={styles.switchIndicator}>
          <View
            style={[
              styles.switchKnob,
              {
                backgroundColor: isOnline ? colors.bg.surface : 'rgba(255, 255, 255, 0.6)',
                transform: [{ translateX: isOnline ? 18 : 0 }],
              },
            ]}
          />
        </View>
      </AppPressable>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  avatarWrap: {
    position: 'relative',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  fallbackAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.bg.surface,
  },
  greetingText: {
    textTransform: 'uppercase',
    fontFamily: typography.families.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  driverName: {
    fontFamily: typography.families.extrabold,
  },
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  vehicleText: {
    fontFamily: typography.families.extrabold,
    fontSize: 10,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[3],
    borderRadius: radii['2xl'],
    borderWidth: 1,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  zapIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: 2,
  },
  statusTitle: {
    fontSize: 16,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: radii.full,
  },
  statusPillText: {
    fontFamily: typography.families.extrabold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  switchIndicator: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    padding: 3,
    justifyContent: 'center',
  },
  switchKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
