import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { User } from 'lucide-react-native';
import { AppText, RatingStars, radii, spacing } from '@daloa/ui';

interface Props {
  driverProfile: any;
  user: any;
  topInset: number;
}

export const ProfileHeroHeader: React.FC<Props> = ({ driverProfile, user, topInset }) => {
  const isVerified = Boolean(driverProfile?.is_verified);

  return (
    <LinearGradient
      colors={['#FFA726', '#FF9800', '#E65100']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroHeader, { paddingTop: topInset + spacing[3] }]}
    >
      <View style={styles.profileRow}>
        <View style={styles.avatarWrap}>
          {driverProfile?.photo_url ? (
            <ExpoImage
              source={{ uri: driverProfile.photo_url }}
              style={styles.avatarImg}
              contentFit="cover"
            />
          ) : (
            <View style={styles.fallbackAvatar}>
              <User size={28} color="#FFFFFF" />
            </View>
          )}
        </View>

        <View style={styles.profileDetails}>
          <View style={styles.nameBadgeRow}>
            <AppText variant="h2" color="#FFFFFF" numberOfLines={1} style={styles.driverName}>
              {driverProfile?.name || 'Livreur Daloa'}
            </AppText>
            <View
              style={[
                styles.verifiedPill,
                { backgroundColor: isVerified ? '#ECFDF5' : '#FFFBEB' },
              ]}
            >
              <AppText
                variant="caption"
                color={isVerified ? '#059669' : '#D97706'}
                style={styles.verifiedText}
              >
                {isVerified ? 'VÉRIFIÉ' : 'EN ATTENTE'}
              </AppText>
            </View>
          </View>

          <AppText variant="caption" color="rgba(255, 255, 255, 0.85)">
            📞 {driverProfile?.phone || user?.email || 'Non renseigné'}
          </AppText>
          <AppText variant="caption" color="rgba(255, 255, 255, 0.85)">
            🛵 {driverProfile?.vehicle_type?.toUpperCase() || 'MOTO'} · Daloa
          </AppText>

          <View style={{ marginTop: 4 }}>
            <RatingStars
              rating={driverProfile?.rating || 5.0}
              totalReviews={driverProfile?.total_reviews || 0}
              size={12}
            />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  heroHeader: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  fallbackAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileDetails: {
    flex: 1,
    gap: 2,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  driverName: {
    fontWeight: '800',
  },
  verifiedPill: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: radii.full,
  },
  verifiedText: {
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 0.5,
  },
});
