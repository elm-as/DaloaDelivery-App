import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { User, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { AppText, RatingStars, radii, spacing } from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import { deliveryPersonService, supabase } from '@daloa/api';
import { useDriverAuth } from '../../context/DriverAuthContext';

interface Props {
  driverProfile: any;
  user: any;
  topInset: number;
}

export const ProfileHeroHeader: React.FC<Props> = ({ driverProfile, user, topInset }) => {
  const { refreshDriverProfile } = useDriverAuth();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const isVerified = Boolean(driverProfile?.is_verified);

  const handlePickPhoto = async () => {
    if (!user?.id || isUploadingPhoto) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Veuillez autoriser l’accès à vos photos pour changer votre photo de profil.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setIsUploadingPhoto(true);
      Haptics.selection();

      const newUrl = await deliveryPersonService.uploadProfilePhoto(
        {
          fileUri: asset.uri,
          base64: asset.base64,
          mimeType: asset.mimeType || 'image/jpeg',
        },
        user.id
      );

      await supabase.from('users').update({ avatar_url: newUrl }).eq('id', user.id);
      await supabase.auth.updateUser({ data: { avatar_url: newUrl, picture: newUrl } });

      if (driverProfile?.id) {
        await supabase.from('delivery_persons').update({ photo_url: newUrl }).eq('id', driverProfile.id);
      }

      await refreshDriverProfile();
      Haptics.success();
      Alert.alert('Succès', 'Votre photo de profil a été mise à jour.');
    } catch (err: any) {
      console.warn('Erreur téléversement photo profil:', err);
      Alert.alert('Erreur', 'Impossible de mettre à jour la photo de profil.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FFA726', '#FF9800', '#E65100']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroHeader, { paddingTop: topInset + spacing[3] }]}
    >
      <View style={styles.profileRow}>
        <TouchableOpacity
          onPress={handlePickPhoto}
          activeOpacity={0.8}
          disabled={isUploadingPhoto}
          style={styles.avatarWrap}
          accessibilityLabel="Changer la photo de profil"
        >
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

          {isUploadingPhoto ? (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>
          ) : (
            <View style={styles.cameraBadge}>
              <Camera size={13} color="#FFFFFF" strokeWidth={2.2} />
            </View>
          )}
        </TouchableOpacity>

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
    position: 'relative',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
  },
  fallbackAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B00',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 31,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
